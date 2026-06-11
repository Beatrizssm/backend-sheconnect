import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/jwt.strategy';
import { JwtGuard } from '../../../auth/jwt.guard';
import { UserProfileProps } from '../../domain/entities/user-profile.entity';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { GetMyProfileUseCase } from '../../application/use-cases/get-my-profile.use-case';
import { ReportUserUseCase } from '../../application/use-cases/report-user.use-case';
import { RequestVerificationUseCase } from '../../application/use-cases/request-verification.use-case';
import { UpdateMyProfileUseCase } from '../../application/use-cases/update-my-profile.use-case';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ReportUserDto } from '../dto/report-user.dto';
import { RequestVerificationDto } from '../dto/request-verification.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@UseGuards(JwtGuard, ThrottlerGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly getMyProfile: GetMyProfileUseCase,
    private readonly updateMyProfile: UpdateMyProfileUseCase,
    private readonly requestVerification: RequestVerificationUseCase,
    private readonly reportUser: ReportUserUseCase,
    private readonly changePassword: ChangePasswordUseCase,
  ) {}

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.getMyProfile.execute(user.id);
    return this.toResponse(profile.toPrimitives());
  }

  @Patch('me')
  async update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    const profile = await this.updateMyProfile.execute(user.id, dto);
    return this.toResponse(profile.toPrimitives());
  }

  @Patch('me/password')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updatePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.changePassword.execute(user.id, dto);
  }

  @Post('request-verification')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async requestVerify(@CurrentUser() user: AuthenticatedUser, @Body() dto: RequestVerificationDto) {
    return this.requestVerification.execute(user.id, dto);
  }

  @Post('me/request-verification')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async requestVerifyLegacy(@CurrentUser() user: AuthenticatedUser, @Body() dto: RequestVerificationDto) {
    return this.requestVerification.execute(user.id, dto);
  }

  @Post(':id/report')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async report(
    @Param('id') reportedUserId: string,
    @Body() dto: ReportUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const report = await this.reportUser.execute(user.id, reportedUserId, dto);

    return {
      message: 'Denúncia registrada com sucesso.',
      reportId: report.toPrimitives().id,
    };
  }

  private toResponse(profile: UserProfileProps) {
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      fullName: profile.fullName,
      professionalName: profile.professionalName,
      bio: profile.bio,
      area: profile.area,
      city: profile.city,
      state: profile.state,
      linkedin: profile.linkedin,
      instagram: profile.instagram,
      website: profile.website,
      profileImage: profile.profileImage,
      verificationStatus: profile.verificationStatus,
      verifiedAt: profile.verifiedAt?.toISOString() ?? null,
      verificationReason: profile.verificationReason,
      verificationNotes: profile.verificationNotes,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
