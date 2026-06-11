import type { ApiRole } from '../../../shared/types/app.types';
import { MENTORSHIP_TERMINAL_STATUSES } from '../domain/mentorship.constants';
import type { Mentorship } from '../domain/mentorship.types';

type AuthUser = {
  id: string;
  role: ApiRole;
};

const REVIEW_STATUSES = new Set(['SOLICITADA', 'EM_ANALISE']);
const SCHEDULE_STATUSES = new Set(['ACEITA']);
const START_STATUSES = new Set(['ACEITA', 'AGENDADA']);
const FINISH_STATUSES = new Set(['AGENDADA', 'EM_ANDAMENTO']);
const CANCEL_STATUSES = new Set(['SOLICITADA', 'EM_ANALISE', 'ACEITA', 'AGENDADA']);

export function canViewMentorships(role: ApiRole): boolean {
  return role === 'ENTREPRENEUR' || role === 'MENTOR' || role === 'ADMIN';
}

export function canCreateMentorship(role: ApiRole): boolean {
  return role === 'ENTREPRENEUR';
}

export function canBrowseMentors(role: ApiRole): boolean {
  return role === 'ENTREPRENEUR' || role === 'ADMIN';
}

export function canAcceptOrRejectMentorship(authUser: AuthUser, mentorship: Mentorship): boolean {
  return (
    REVIEW_STATUSES.has(mentorship.status) &&
    (authUser.role === 'ADMIN' || (authUser.role === 'MENTOR' && mentorship.mentorId === authUser.id))
  );
}

export function canScheduleMentorship(authUser: AuthUser, mentorship: Mentorship): boolean {
  return (
    SCHEDULE_STATUSES.has(mentorship.status) &&
    (authUser.role === 'ADMIN' || (authUser.role === 'MENTOR' && mentorship.mentorId === authUser.id))
  );
}

export function canStartMentorship(authUser: AuthUser, mentorship: Mentorship): boolean {
  return (
    START_STATUSES.has(mentorship.status) &&
    (authUser.role === 'ADMIN' || (authUser.role === 'MENTOR' && mentorship.mentorId === authUser.id))
  );
}

export function canFinishMentorship(authUser: AuthUser, mentorship: Mentorship): boolean {
  return (
    FINISH_STATUSES.has(mentorship.status) &&
    (authUser.role === 'ADMIN' || (authUser.role === 'MENTOR' && mentorship.mentorId === authUser.id))
  );
}

export function canCancelMentorship(authUser: AuthUser, mentorship: Mentorship): boolean {
  return (
    CANCEL_STATUSES.has(mentorship.status) &&
    (authUser.role === 'ADMIN' ||
      (authUser.role === 'ENTREPRENEUR' && mentorship.entrepreneurId === authUser.id))
  );
}

export function isMentorshipTerminal(status: Mentorship['status']): boolean {
  return MENTORSHIP_TERMINAL_STATUSES.includes(status);
}

export function getMentorshipPageTitle(role: ApiRole): string {
  if (role === 'MENTOR') return 'Mentorias recebidas';
  if (role === 'ENTREPRENEUR') return 'Minhas mentorias';
  return 'Mentorias';
}

export function getMentorshipPageSubtitle(role: ApiRole): string {
  if (role === 'MENTOR') {
    return 'Gerencie solicitações, agende sessões e acompanhe o progresso das empreendedoras.';
  }
  if (role === 'ENTREPRENEUR') {
    return 'Solicite mentorias, acompanhe status e conecte-se com especialistas.';
  }
  return 'Painel administrativo de mentorias.';
}
