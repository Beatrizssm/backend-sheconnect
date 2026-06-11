import { BadRequestException } from '@nestjs/common';
import { MentorshipStatus } from '../entities/mentorship.entity';

const TERMINAL_STATUSES = new Set<MentorshipStatus>([
  MentorshipStatus.REJEITADA,
  MentorshipStatus.CONCLUIDA,
  MentorshipStatus.CANCELADA,
]);

const ALLOWED_TRANSITIONS: Record<MentorshipStatus, MentorshipStatus[]> = {
  [MentorshipStatus.SOLICITADA]: [
    MentorshipStatus.EM_ANALISE,
    MentorshipStatus.ACEITA,
    MentorshipStatus.AGENDADA,
    MentorshipStatus.REJEITADA,
    MentorshipStatus.CANCELADA,
  ],
  [MentorshipStatus.EM_ANALISE]: [
    MentorshipStatus.ACEITA,
    MentorshipStatus.AGENDADA,
    MentorshipStatus.REJEITADA,
    MentorshipStatus.CANCELADA,
  ],
  [MentorshipStatus.ACEITA]: [
    MentorshipStatus.AGENDADA,
    MentorshipStatus.EM_ANDAMENTO,
    MentorshipStatus.CANCELADA,
  ],
  [MentorshipStatus.AGENDADA]: [
    MentorshipStatus.EM_ANDAMENTO,
    MentorshipStatus.CONCLUIDA,
    MentorshipStatus.CANCELADA,
  ],
  [MentorshipStatus.EM_ANDAMENTO]: [MentorshipStatus.CONCLUIDA],
  [MentorshipStatus.REJEITADA]: [],
  [MentorshipStatus.CONCLUIDA]: [],
  [MentorshipStatus.CANCELADA]: [],
};

export function ensureMentorshipStatusTransition(
  currentStatus: MentorshipStatus,
  nextStatus: MentorshipStatus,
): void {
  if (TERMINAL_STATUSES.has(currentStatus)) {
    throw new BadRequestException(`Mentorship in status ${currentStatus} cannot be changed.`);
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  if (!allowed.includes(nextStatus)) {
    throw new BadRequestException(
      `Cannot transition mentorship from ${currentStatus} to ${nextStatus}.`,
    );
  }
}
