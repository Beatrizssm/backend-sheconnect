import type { MentorshipStatus } from './mentorship.types';



export const EMPTY_MENTORSHIP_FORM = {

  mentorId: '',

  title: '',

  description: '',

  category: '',

  mentorshipArea: '',

  initialMessage: '',

};



export const MENTORSHIP_STATUS_LABELS: Record<MentorshipStatus, string> = {

  SOLICITADA: 'Solicitada',

  EM_ANALISE: 'Em análise',

  ACEITA: 'Aceita',

  REJEITADA: 'Rejeitada',

  AGENDADA: 'Agendada',

  EM_ANDAMENTO: 'Em andamento',

  CONCLUIDA: 'Concluída',

  CANCELADA: 'Cancelada',

};



export const MENTORSHIP_STATUS_STYLES: Record<MentorshipStatus, string> = {

  SOLICITADA: 'bg-amber-100 text-amber-700',

  EM_ANALISE: 'bg-orange-100 text-orange-700',

  ACEITA: 'bg-blue-100 text-blue-700',

  REJEITADA: 'bg-red-100 text-red-700',

  AGENDADA: 'bg-indigo-100 text-indigo-700',

  EM_ANDAMENTO: 'bg-violet-100 text-violet-700',

  CONCLUIDA: 'bg-green-100 text-green-700',

  CANCELADA: 'bg-slate-100 text-slate-600',

};



export const MENTORSHIP_TERMINAL_STATUSES: MentorshipStatus[] = [

  'REJEITADA',

  'CONCLUIDA',

  'CANCELADA',

];


