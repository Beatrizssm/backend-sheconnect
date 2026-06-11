import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Role } from '../../../../domains/user/enums/role.enum';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/jwt.strategy';
import { JwtGuard } from '../../../auth/jwt.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { ApproveVerificationUseCase } from '../../application/use-cases/approve-verification.use-case';
import { ListOpenReportsUseCase } from '../../application/use-cases/list-open-reports.use-case';
import { ListPendingVerificationsUseCase } from '../../application/use-cases/list-pending-verifications.use-case';
import { RejectVerificationUseCase } from '../../application/use-cases/reject-verification.use-case';
import { RejectVerificationDto } from '../dto/reject-verification.dto';

@UseGuards(JwtGuard, RolesGuard, ThrottlerGuard)
@Roles(Role.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly approveVerification: ApproveVerificationUseCase,
    private readonly rejectVerification: RejectVerificationUseCase,
    private readonly listPendingVerifications: ListPendingVerificationsUseCase,
    private readonly listOpenReports: ListOpenReportsUseCase,
  ) {}

  @Get('pending-verifications')
  async pending() {
    const profiles = await this.listPendingVerifications.execute();

    return profiles.map((profile) => {
      const data = profile.toPrimitives();
      return {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        linkedin: data.linkedin,
        instagram: data.instagram,
        website: data.website,
        verificationNotes: data.verificationNotes,
        verificationStatus: data.verificationStatus,
        updatedAt: data.updatedAt.toISOString(),
      };
    });
  }

  @Get('reports')
  async reports() {
    const items = await this.listOpenReports.execute();

    return items.map((report) => {
      const data = report.toPrimitives();
      return {
        id: data.id,
        reporterId: data.reporterId,
        reportedUserId: data.reportedUserId,
        reason: data.reason,
        description: data.description,
        status: data.status,
        createdAt: data.createdAt.toISOString(),
      };
    });
  }

  @Patch(':id/approve-verification')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async approve(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    const profile = await this.approveVerification.execute(id, admin.id);
    const data = profile.toPrimitives();

    return {
      message: 'Verificação aprovada com sucesso.',
      verificationStatus: data.verificationStatus,
      verifiedAt: data.verifiedAt?.toISOString() ?? null,
    };
  }

  @Patch(':id/reject-verification')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectVerificationDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const profile = await this.rejectVerification.execute(id, admin.id, dto.reason);
    const data = profile.toPrimitives();

    return {
      message: 'Verificação rejeitada.',
      verificationStatus: data.verificationStatus,
      verificationReason: data.verificationReason,
    };
  }
}
