import { BadRequestException, ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { DomainEventType, EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { MentorshipEntity, MentorshipStatus } from '../../../domain/entities/mentorship.entity';
import { ensureMentorshipStatusTransition } from '../../../domain/policies/mentorship-status.policy';
import {
  MENTORSHIP_REPOSITORY,
  MentorshipRepository,
} from '../../../domain/repositories/mentorship.repository';
import { GetMentorshipUseCase } from '../get-mentorship/get-mentorship.use-case';

export type ChangeMentorshipStatusInput = {
  id: string;
  userId: string;
  userRole: Role;
  status: MentorshipStatus;
  scheduledAt?: Date | null;
  rejectionReason?: string | null;
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
    ensureMentorshipStatusTransition(mentorship.status, input.status);

    const completedAt =
      input.status === MentorshipStatus.CONCLUIDA ? new Date() : undefined;

    const updatedMentorship = await this.mentorships.updateStatus(mentorship.id, {
      status: input.status,
      scheduledAt: input.scheduledAt,
      completedAt,
      rejectionReason: input.rejectionReason,
    });

    const beforeData = mentorship.toPrimitives();
    const afterData = updatedMentorship.toPrimitives();

    await this.auditLogger.log({
      action: this.getAuditAction(input.status),
      userId: input.userId,
      entity: 'Mentorship',
      entityId: updatedMentorship.id,
      beforeData,
      afterData,
      oldValue: { status: beforeData.status },
      newValue: { status: afterData.status },
    });
    const eventType = this.getDomainEventType(input.status);

    if (eventType) {
      await this.eventBus?.publish(eventType, {
        userId: input.userId,
        entityId: updatedMentorship.id,
        payload: updatedMentorship.toPrimitives(),
      });
    }

    return updatedMentorship;
  }

  private ensureCanChangeStatus(
    mentorship: MentorshipEntity,
    input: ChangeMentorshipStatusInput,
  ): void {
    if (input.userRole === Role.INVESTOR) {
      throw new ForbiddenException('Investors cannot manage mentorships.');
    }

    if (input.status === MentorshipStatus.CANCELADA) {
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
      [MentorshipStatus.SOLICITADA]: 'MENTORSHIP_CREATED',
      [MentorshipStatus.EM_ANALISE]: 'MENTORSHIP_IN_REVIEW',
      [MentorshipStatus.ACEITA]: 'MENTORSHIP_ACCEPTED',
      [MentorshipStatus.REJEITADA]: 'MENTORSHIP_REJECTED',
      [MentorshipStatus.AGENDADA]: 'MENTORSHIP_SCHEDULED',
      [MentorshipStatus.EM_ANDAMENTO]: 'MENTORSHIP_STARTED',
      [MentorshipStatus.CONCLUIDA]: 'MENTORSHIP_COMPLETED',
      [MentorshipStatus.CANCELADA]: 'MENTORSHIP_CANCELLED',
    };

    return actions[status];
  }

  private getDomainEventType(status: MentorshipStatus): DomainEventType | null {
    const events: Partial<Record<MentorshipStatus, DomainEventType>> = {
      [MentorshipStatus.ACEITA]: 'MENTORSHIP_ACCEPTED',
      [MentorshipStatus.AGENDADA]: 'MENTORSHIP_ACCEPTED',
      [MentorshipStatus.REJEITADA]: 'MENTORSHIP_REJECTED',
      [MentorshipStatus.CONCLUIDA]: 'MENTORSHIP_COMPLETED',
      [MentorshipStatus.CANCELADA]: 'MENTORSHIP_CANCELLED',
    };

    return events[status] ?? null;
  }
}
