import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../../../domains/user/enums/role.enum';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '../../../auth/jwt.strategy';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { JwtGuard } from '../../../auth/jwt.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { AcceptMentorshipUseCase } from '../../application/use-cases/accept-mentorship/accept-mentorship.use-case';
import { CancelMentorshipUseCase } from '../../application/use-cases/cancel-mentorship/cancel-mentorship.use-case';
import { CompleteMentorshipUseCase } from '../../application/use-cases/complete-mentorship/complete-mentorship.use-case';
import { CreateMentorshipUseCase } from '../../application/use-cases/create-mentorship/create-mentorship.use-case';
import { GetMentorshipUseCase } from '../../application/use-cases/get-mentorship/get-mentorship.use-case';
import { ListMentorshipsUseCase } from '../../application/use-cases/list-mentorships/list-mentorships.use-case';
import { RejectMentorshipUseCase } from '../../application/use-cases/reject-mentorship/reject-mentorship.use-case';
import { CreateMentorshipDto } from '../dto/create-mentorship.dto';
import { ListMentorshipsQueryDto } from '../dto/list-mentorships-query.dto';
import { UpdateMentorshipStatusDto } from '../dto/update-mentorship-status.dto';
import { MentorshipMapper } from '../mappers/mentorship.mapper';

type MentorshipResponse = ReturnType<typeof MentorshipMapper.toResponse> & {
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
  entrepreneur?: {
    id: string;
    name: string;
    email: string;
  };
};

@UseGuards(JwtGuard, RolesGuard)
@Controller('mentorships')
export class MentorshipsController {
  constructor(
    private readonly createMentorship: CreateMentorshipUseCase,
    private readonly listMentorships: ListMentorshipsUseCase,
    private readonly getMentorship: GetMentorshipUseCase,
    private readonly acceptMentorship: AcceptMentorshipUseCase,
    private readonly rejectMentorship: RejectMentorshipUseCase,
    private readonly completeMentorship: CompleteMentorshipUseCase,
    private readonly cancelMentorship: CancelMentorshipUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles(Role.ENTREPRENEUR)
  async create(@Body() dto: CreateMentorshipDto, @CurrentUser() user: AuthenticatedUser) {
    const mentorship = await this.createMentorship.execute({
      ...dto,
      entrepreneurId: user.id,
      entrepreneurRole: user.role,
    });

    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));
  }

  @Get()
  async list(@Query() query: ListMentorshipsQueryDto, @CurrentUser() user: AuthenticatedUser) {
    const mentorships = await this.listMentorships.execute({
      userId: user.id,
      userRole: user.role,
      status: query.status,
      category: query.category,
    });

    return this.enrichMentorships(mentorships.map(MentorshipMapper.toResponse));
  }

  @Get('mentors')
  @Roles(Role.ENTREPRENEUR, Role.ADMIN)
  async mentors() {
    return this.prisma.user.findMany({
      where: { role: Role.MENTOR },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const mentorship = await this.getMentorship.execute({
      id,
      userId: user.id,
      userRole: user.role,
    });

    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));
  }

  @Patch(':id/accept')
  @Roles(Role.MENTOR, Role.ADMIN)
  async accept(
    @Param('id') id: string,
    @Body() dto: UpdateMentorshipStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const mentorship = await this.acceptMentorship.execute({
      id,
      userId: user.id,
      userRole: user.role,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });

    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));
  }

  @Patch(':id/reject')
  @Roles(Role.MENTOR, Role.ADMIN)
  async reject(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const mentorship = await this.rejectMentorship.execute({
      id,
      userId: user.id,
      userRole: user.role,
    });

    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));
  }

  @Patch(':id/complete')
  @Roles(Role.MENTOR, Role.ADMIN)
  async complete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const mentorship = await this.completeMentorship.execute({
      id,
      userId: user.id,
      userRole: user.role,
    });

    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));
  }

  @Patch(':id/cancel')
  @Roles(Role.ENTREPRENEUR, Role.ADMIN)
  async cancel(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const mentorship = await this.cancelMentorship.execute({
      id,
      userId: user.id,
      userRole: user.role,
    });

    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));
  }

  private async enrichMentorship(mentorship: ReturnType<typeof MentorshipMapper.toResponse>) {
    const [enriched] = await this.enrichMentorships([mentorship]);
    return enriched;
  }

  private async enrichMentorships(
    mentorships: ReturnType<typeof MentorshipMapper.toResponse>[],
  ): Promise<MentorshipResponse[]> {
    if (mentorships.length === 0) {
      return [];
    }

    const userIds = Array.from(
      new Set(mentorships.flatMap((mentorship) => [mentorship.mentorId, mentorship.entrepreneurId])),
    );

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const usersById = new Map(users.map((user) => [user.id, user]));

    return mentorships.map((mentorship) => ({
      ...mentorship,
      mentor: usersById.get(mentorship.mentorId),
      entrepreneur: usersById.get(mentorship.entrepreneurId),
    }));
  }
}
