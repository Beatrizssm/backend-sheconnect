import { ForbiddenException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { Role } from '../../../../../domains/user/enums/role.enum';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../../../domains/user/repositories/user.repository.port';
import { MentorshipEntity } from '../../../domain/entities/mentorship.entity';
import {
  MENTORSHIP_REPOSITORY,
  MentorshipRepository,
} from '../../../domain/repositories/mentorship.repository';

export type CreateMentorshipInput = {
  entrepreneurId: string;
  entrepreneurRole: Role;
  mentorId: string;
  title: string;
  description: string;
  category: string;
  mentorshipArea?: string;
  initialMessage?: string;
};

@Injectable()
export class CreateMentorshipUseCase {
  constructor(
    @Inject(MENTORSHIP_REPOSITORY)
    private readonly mentorships: MentorshipRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
    @Optional()
    @Inject(EVENT_BUS)
    private readonly eventBus?: EventBusPort,
  ) {}

  async execute(input: CreateMentorshipInput): Promise<MentorshipEntity> {
    if (input.entrepreneurRole !== Role.ENTREPRENEUR) {
      throw new ForbiddenException('Only entrepreneurs can request mentorships.');
    }

    const mentor = await this.users.findById(input.mentorId);

    if (!mentor) {
      throw new NotFoundException('Mentor not found.');
    }

    if (mentor.role !== Role.MENTOR) {
      throw new ForbiddenException('Only mentors can receive mentorship requests.');
    }

    const mentorship = await this.mentorships.create(
      MentorshipEntity.create({
        entrepreneurId: input.entrepreneurId,
        mentorId: input.mentorId,
        title: input.title,
        description: input.description,
        category: input.category,
        mentorshipArea: input.mentorshipArea,
        initialMessage: input.initialMessage,
      }),
    );

    const afterData = mentorship.toPrimitives();

    await this.auditLogger.log({
      action: 'MENTORSHIP_CREATED',
      userId: input.entrepreneurId,
      entity: 'Mentorship',
      entityId: mentorship.id,
      afterData,
      newValue: { status: afterData.status },
    });
    await this.eventBus?.publish('MENTORSHIP_REQUESTED', {
      userId: input.entrepreneurId,
      entityId: mentorship.id,
      payload: afterData,
    });

    return mentorship;
  }
}
