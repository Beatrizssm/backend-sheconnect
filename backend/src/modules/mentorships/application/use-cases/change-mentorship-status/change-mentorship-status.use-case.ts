import { ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { DomainEventType, EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { MentorshipEntity, MentorshipStatus } from '../../../domain/entities/mentorship.entity';
import {
  MENTORSHIP_REPOSITORY,
  MentorshipRepository,
} from '../../../domain/repositories/mentorship.repository';
import { GetMentorshipUseCase } from '../get-mentorship/get-mentorship.use-case';

type ChangeMentorshipStatusInput = {
  id: string;
  userId: string;
  userRole: Role;
  status: MentorshipStatus;
  scheduledAt?: Date | null;
};

@Injectable()
export class ChangeMentorshipStatusUseCase {
  constructor(
    @Inject(MENTORSHIP_REPOSITORY)
    private readonly mentorships: MentorshipRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
    private readonly getMentorship: GetMentorshipUseCase,
    @Optional()
    @Inject(EVENT_BUS)
    private readonly eventBus?: EventBusPort,
  ) {}

  async execute(input: ChangeMentorshipStatusInput): Promise<MentorshipEntity> {
    const mentorship = await this.getMentorship.execute({
      id: input.id,
      userId: input.userId,
      userRole: input.userRole,
    });

    this.ensureCanChangeStatus(mentorship, input);

    const updatedMentorship = await this.mentorships.updateStatus(mentorship.id, {
      status: input.status,
      scheduledAt: input.scheduledAt,
    });

    await this.auditLogger.log({
      action: this.getAuditAction(input.status),
      userId: input.userId,
      entity: 'Mentorship',
      entityId: updatedMentorship.id,
      beforeData: {
        status: mentorship.status,
        mentorId: mentorship.mentorId,
        entrepreneurId: mentorship.entrepreneurId,
      },
      afterData: {
        status: updatedMentorship.status,
        mentorId: updatedMentorship.mentorId,
        entrepreneurId: updatedMentorship.entrepreneurId,
      },
    });
    await this.eventBus?.publish(this.getDomainEventType(input.status), {
      userId: input.userId,
      entityId: updatedMentorship.id,
      payload: updatedMentorship.toPrimitives(),
    });

    return updatedMentorship;
  }

  private ensureCanChangeStatus(
    mentorship: MentorshipEntity,
    input: ChangeMentorshipStatusInput,
  ): void {
    if (input.status === MentorshipStatus.CANCELLED) {
      const canCancel =
        input.userRole === Role.ADMIN ||
        (input.userRole === Role.ENTREPRENEUR && mentorship.entrepreneurId === input.userId);

      if (!canCancel) {
        throw new ForbiddenException('You cannot cancel this mentorship.');
      }

      return;
    }

    if (input.userRole === Role.ADMIN) {
      return;
    }

    if (input.userRole !== Role.MENTOR || mentorship.mentorId !== input.userId) {
      throw new ForbiddenException('Only the responsible mentor can change this mentorship status.');
    }
  }

  private getAuditAction(status: MentorshipStatus): string {
    const actions: Record<MentorshipStatus, string> = {
      [MentorshipStatus.PENDING]: 'MENTORSHIP_PENDING',
      [MentorshipStatus.ACCEPTED]: 'MENTORSHIP_ACCEPTED',
      [MentorshipStatus.REJECTED]: 'MENTORSHIP_REJECTED',
      [MentorshipStatus.COMPLETED]: 'MENTORSHIP_COMPLETED',
      [MentorshipStatus.CANCELLED]: 'MENTORSHIP_CANCELLED',
    };

    return actions[status];
  }

  private getDomainEventType(status: MentorshipStatus): DomainEventType {
    const events: Record<MentorshipStatus, DomainEventType> = {
      [MentorshipStatus.PENDING]: 'MENTORSHIP_CREATED',
      [MentorshipStatus.ACCEPTED]: 'MENTORSHIP_ACCEPTED',
      [MentorshipStatus.REJECTED]: 'MENTORSHIP_REJECTED',
      [MentorshipStatus.COMPLETED]: 'MENTORSHIP_COMPLETED',
      [MentorshipStatus.CANCELLED]: 'MENTORSHIP_CANCELLED',
    };

    return events[status];
  }
}
