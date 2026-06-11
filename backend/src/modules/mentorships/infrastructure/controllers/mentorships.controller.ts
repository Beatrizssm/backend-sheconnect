import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { Role } from '../../../../domains/user/enums/role.enum';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { AuthenticatedUser } from '../../../auth/jwt.strategy';

import { CurrentUser } from '../../../auth/current-user.decorator';

import { JwtGuard } from '../../../auth/jwt.guard';

import { Roles } from '../../../auth/roles.decorator';

import { RolesGuard } from '../../../auth/roles.guard';

import { VerifiedUserGuard } from '../../../auth/verified-user.guard';

import { AcceptMentorshipUseCase } from '../../application/use-cases/accept-mentorship/accept-mentorship.use-case';

import { CancelMentorshipUseCase } from '../../application/use-cases/cancel-mentorship/cancel-mentorship.use-case';

import { CompleteMentorshipUseCase } from '../../application/use-cases/complete-mentorship/complete-mentorship.use-case';

import { CreateMentorshipUseCase } from '../../application/use-cases/create-mentorship/create-mentorship.use-case';

import { FinishMentorshipUseCase } from '../../application/use-cases/finish-mentorship/finish-mentorship.use-case';

import { GetMentorshipUseCase } from '../../application/use-cases/get-mentorship/get-mentorship.use-case';

import { ListMentorshipsUseCase } from '../../application/use-cases/list-mentorships/list-mentorships.use-case';

import { RejectMentorshipUseCase } from '../../application/use-cases/reject-mentorship/reject-mentorship.use-case';

import { ScheduleMentorshipUseCase } from '../../application/use-cases/schedule-mentorship/schedule-mentorship.use-case';

import { StartMentorshipUseCase } from '../../application/use-cases/start-mentorship/start-mentorship.use-case';

import { CreateMentorshipDto } from '../dto/create-mentorship.dto';

import { ListMentorshipsQueryDto } from '../dto/list-mentorships-query.dto';

import { RejectMentorshipDto } from '../dto/reject-mentorship.dto';

import { ScheduleMentorshipDto } from '../dto/schedule-mentorship.dto';

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

  startupId?: string | null;

  feedback?: string | null;

  rating?: number | null;

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

    private readonly scheduleMentorship: ScheduleMentorshipUseCase,

    private readonly startMentorship: StartMentorshipUseCase,

    private readonly completeMentorship: CompleteMentorshipUseCase,

    private readonly finishMentorship: FinishMentorshipUseCase,

    private readonly cancelMentorship: CancelMentorshipUseCase,

    private readonly prisma: PrismaService,

  ) {}



  @Post()

  @UseGuards(VerifiedUserGuard)

  @Roles(Role.ENTREPRENEUR)

  async create(@Body() dto: CreateMentorshipDto, @CurrentUser() user: AuthenticatedUser) {

    const mentorship = await this.createMentorship.execute({

      entrepreneurId: user.id,

      entrepreneurRole: user.role,

      mentorId: dto.mentorId,

      title: dto.title,

      description: dto.description,

      category: dto.category,

      mentorshipArea: dto.mentorshipArea,

      initialMessage: dto.initialMessage,

    });

    await this.persistMentorshipDetails(mentorship.id, dto);



    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));

  }



  @Post('request')

  @UseGuards(VerifiedUserGuard)

  @Roles(Role.ENTREPRENEUR)

  request(@Body() dto: CreateMentorshipDto, @CurrentUser() user: AuthenticatedUser) {

    return this.create(dto, user);

  }



  @Get()

  @Roles(Role.ENTREPRENEUR, Role.MENTOR, Role.ADMIN)

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

        specialty: true,

        area: true,

      },

    });

  }



  @Get('my')

  @Roles(Role.ENTREPRENEUR, Role.MENTOR, Role.ADMIN)

  async my(@Query() query: ListMentorshipsQueryDto, @CurrentUser() user: AuthenticatedUser) {

    return this.list(query, user);

  }



  @Get(':id')

  @Roles(Role.ENTREPRENEUR, Role.MENTOR, Role.ADMIN)

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

    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;

    if (scheduledAt) {

      await this.ensureMentorAvailability(id, user.id, scheduledAt);

    }



    const mentorship = await this.acceptMentorship.execute({

      id,

      userId: user.id,

      userRole: user.role,

      scheduledAt,

    });



    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));

  }



  @Patch(':id/reject')

  @Roles(Role.MENTOR, Role.ADMIN)

  async reject(

    @Param('id') id: string,

    @Body() dto: RejectMentorshipDto,

    @CurrentUser() user: AuthenticatedUser,

  ) {

    const mentorship = await this.rejectMentorship.execute({

      id,

      userId: user.id,

      userRole: user.role,

      rejectionReason: dto.rejectionReason,

    });



    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));

  }



  @Patch(':id/schedule')

  @Roles(Role.MENTOR, Role.ADMIN)

  async schedule(

    @Param('id') id: string,

    @Body() dto: ScheduleMentorshipDto,

    @CurrentUser() user: AuthenticatedUser,

  ) {

    const scheduledAt = new Date(dto.scheduledAt);

    await this.ensureMentorAvailability(id, user.id, scheduledAt);



    const mentorship = await this.scheduleMentorship.execute({

      id,

      userId: user.id,

      userRole: user.role,

      scheduledAt,

    });



    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));

  }



  @Patch(':id/start')

  @Roles(Role.MENTOR, Role.ADMIN)

  async start(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {

    const mentorship = await this.startMentorship.execute({

      id,

      userId: user.id,

      userRole: user.role,

    });



    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));

  }



  @Patch(':id/complete')

  @Roles(Role.MENTOR, Role.ADMIN)

  async complete(

    @Param('id') id: string,

    @Body() dto: UpdateMentorshipStatusDto,

    @CurrentUser() user: AuthenticatedUser,

  ) {

    const mentorship = await this.completeMentorship.execute({

      id,

      userId: user.id,

      userRole: user.role,

    });

    await this.prisma.mentorship.update({

      where: { id },

      data: {

        feedback: dto.feedback,

        rating: dto.rating,

      },

    });



    return this.enrichMentorship(MentorshipMapper.toResponse(mentorship));

  }



  @Patch(':id/finish')

  @Roles(Role.MENTOR, Role.ADMIN)

  finish(

    @Param('id') id: string,

    @Body() dto: UpdateMentorshipStatusDto,

    @CurrentUser() user: AuthenticatedUser,

  ) {

    return this.complete(id, dto, user);

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

    const details = await this.prisma.mentorship.findMany({

      where: { id: { in: mentorships.map((mentorship) => mentorship.id) } },

      select: {

        id: true,

        startupId: true,

        feedback: true,

        rating: true,

      },

    });

    const detailsById = new Map(details.map((detail) => [detail.id, detail]));



    return mentorships.map((mentorship) => ({

      ...mentorship,

      mentor: usersById.get(mentorship.mentorId),

      entrepreneur: usersById.get(mentorship.entrepreneurId),

      startupId: detailsById.get(mentorship.id)?.startupId ?? null,

      feedback: detailsById.get(mentorship.id)?.feedback ?? null,

      rating: detailsById.get(mentorship.id)?.rating ?? null,

    }));

  }



  private async persistMentorshipDetails(id: string, dto: CreateMentorshipDto): Promise<void> {

    if (!dto.startupId && !dto.scheduledAt) {

      return;

    }



    await this.prisma.mentorship.update({

      where: { id },

      data: {

        startupId: dto.startupId,

        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,

      },

    });

  }



  private async ensureMentorAvailability(id: string, mentorId: string, scheduledAt: Date): Promise<void> {

    const startsAt = new Date(scheduledAt);

    startsAt.setMinutes(startsAt.getMinutes() - 59);

    const endsAt = new Date(scheduledAt);

    endsAt.setMinutes(endsAt.getMinutes() + 59);



    const conflictingMentorship = await this.prisma.mentorship.findFirst({

      where: {

        id: { not: id },

        mentorId,

        status: { in: ['ACEITA', 'AGENDADA', 'EM_ANDAMENTO'] },

        scheduledAt: {

          gte: startsAt,

          lte: endsAt,

        },

      },

    });



    if (conflictingMentorship) {

      throw new BadRequestException('Mentor is not available at the selected time.');

    }

  }

}


