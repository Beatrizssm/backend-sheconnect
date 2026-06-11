export type MentorshipStatus =

  | 'SOLICITADA'

  | 'EM_ANALISE'

  | 'ACEITA'

  | 'REJEITADA'

  | 'AGENDADA'

  | 'EM_ANDAMENTO'

  | 'CONCLUIDA'

  | 'CANCELADA';



export type MentorshipUserSummary = {

  id: string;

  name: string;

  email: string;

  specialty?: string | null;

  area?: string | null;

};



export type Mentorship = {

  id: string;

  entrepreneurId: string;

  mentorId: string;

  title: string;

  description: string;

  category: string;

  mentorshipArea?: string | null;

  initialMessage?: string | null;

  status: MentorshipStatus;

  scheduledAt: string | null;

  completedAt?: string | null;

  rejectionReason?: string | null;

  createdAt: string;

  updatedAt: string;

  startupId?: string | null;

  feedback?: string | null;

  rating?: number | null;

  mentor?: MentorshipUserSummary;

  entrepreneur?: MentorshipUserSummary;

};



export type MentorshipFilters = {

  status?: MentorshipStatus | '';

  category?: string;

};



export type CreateMentorshipPayload = {

  mentorId: string;

  title: string;

  description: string;

  category: string;

  mentorshipArea?: string;

  initialMessage?: string;

  startupId?: string;

  scheduledAt?: string;

};


