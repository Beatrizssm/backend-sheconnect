import type { ChatConversation, ChatMessage } from '../modules/chat';
import type { SheConnectEvent } from '../modules/events';
import type { Mentorship } from '../modules/mentorships';
import type { Notification } from '../modules/notifications';
import type { Startup } from '../modules/startups';

export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';

export const DEMO_PROFILE = {
  name: 'Mariana Costa',
  roleLabel: 'Empreendedora',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
};

export const DEMO_STARTUPS: Startup[] = [
  {
    id: 'demo-startup-1',
    founderId: DEMO_USER_ID,
    name: 'TechGirls',
    category: 'Educação',
    description: 'Plataforma de educação tecnológica para meninas.',
    stage: 'Seed',
    website: 'https://techgirls.example.com',
    linkedin: null,
    instagram: null,
    pitch: 'Democratizar o acesso à tecnologia.',
    createdAt: '2025-11-10T10:00:00.000Z',
    updatedAt: '2025-11-10T10:00:00.000Z',
  },
  {
    id: 'demo-startup-2',
    founderId: DEMO_USER_ID,
    name: 'GreenMind',
    category: 'Sustentabilidade',
    description: 'Soluções para economia circular em pequenas empresas.',
    stage: 'Ideação',
    website: null,
    linkedin: null,
    instagram: null,
    pitch: null,
    createdAt: '2025-10-02T10:00:00.000Z',
    updatedAt: '2025-10-02T10:00:00.000Z',
  },
  {
    id: 'demo-startup-3',
    founderId: DEMO_USER_ID,
    name: 'Vita Health',
    category: 'Saúde',
    description: 'Monitoramento remoto de pacientes com foco em bem-estar.',
    stage: 'Validação',
    website: null,
    linkedin: null,
    instagram: null,
    pitch: null,
    createdAt: '2025-09-15T10:00:00.000Z',
    updatedAt: '2025-09-15T10:00:00.000Z',
  },
];

export const DEMO_CONNECTIONS = [
  {
    id: 'demo-conn-1',
    sourceUserId: 'demo-user-mentor-1',
    name: 'Juliana Silva',
    role: 'Mentora',
    specialty: 'Finanças',
    connectedAt: '12/05/2025',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    bio: 'Especialista em finanças corporativas e investimentos.',
    stats: { mentorias: 48, conexões: 312, startups: 15, eventos: 22 },
    expertise: ['Finanças', 'Investimentos', 'Valuation'],
  },
  {
    id: 'demo-conn-2',
    sourceUserId: 'demo-user-mentor-2',
    name: 'Ana Clara Lima',
    role: 'Mentora',
    specialty: 'Growth',
    connectedAt: '08/05/2025',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    bio: 'Mentora de growth para startups em estágio inicial.',
    stats: { mentorias: 60, conexões: 420, startups: 8, eventos: 35 },
    expertise: ['Growth', 'Marketing', 'Produto'],
  },
  {
    id: 'demo-conn-3',
    sourceUserId: 'demo-user-investor-1',
    name: 'Fernanda Rocha',
    role: 'Investidora',
    specialty: 'Venture Capital',
    connectedAt: '05/05/2025',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ff6747cae0?w=100&h=100&fit=crop',
    bio: 'Partner em fundo de VC focado em mulheres fundadoras.',
    stats: { mentorias: 30, conexões: 500, startups: 45, eventos: 12 },
    expertise: ['VC', 'M&A', 'Strategy'],
  },
];

export const DEMO_EVENTS: SheConnectEvent[] = [
  {
    id: 'demo-event-1',
    title: 'Startup Day Women 2025',
    description: 'O maior encontro de empreendedorismo feminino do Brasil.',
    category: 'Networking',
    type: 'Presencial',
    speaker: 'SheConnect',
    location: 'São Paulo - SP',
    isOnline: false,
    meetingLink: null,
    eventDate: '2025-05-24T14:00:00.000Z',
    maxAttendees: 500,
    organizerId: 'demo-organizer',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 'demo-event-2',
    title: 'Tech & Business Summit',
    description: 'Inovação e tecnologia impulsionando negócios femininos.',
    category: 'Tecnologia',
    type: 'Online',
    speaker: 'Convidadas especiais',
    location: 'Online',
    isOnline: true,
    meetingLink: 'https://meet.example.com/demo',
    eventDate: '2025-06-10T18:00:00.000Z',
    maxAttendees: 1000,
    organizerId: 'demo-organizer',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
];

export const DEMO_MENTORSHIPS: Mentorship[] = [
  {
    id: 'demo-mentorship-1',
    entrepreneurId: DEMO_USER_ID,
    mentorId: 'demo-user-mentor-1',
    title: 'Estruturação financeira',
    description: 'Revisão de fluxo de caixa e metas de captação.',
    category: 'Finanças',
    status: 'SOLICITADA',
    mentorshipArea: 'Finanças',
    initialMessage: 'Preciso de ajuda com fluxo de caixa.',
    scheduledAt: null,
    createdAt: '2025-11-20T10:00:00.000Z',
    updatedAt: '2025-11-20T10:00:00.000Z',
    mentor: { id: 'demo-user-mentor-1', name: 'Juliana Silva', email: 'juliana@demo.sheconnect' },
  },
  {
    id: 'demo-mentorship-2',
    entrepreneurId: DEMO_USER_ID,
    mentorId: 'demo-user-mentor-2',
    title: 'Plano de growth',
    description: 'Definição de canais e métricas para os próximos 90 dias.',
    category: 'Growth',
    status: 'AGENDADA',
    mentorshipArea: 'Growth',
    initialMessage: 'Quero estruturar canais de aquisição.',
    scheduledAt: '2025-12-05T15:00:00.000Z',
    createdAt: '2025-10-18T10:00:00.000Z',
    updatedAt: '2025-10-25T10:00:00.000Z',
    mentor: { id: 'demo-user-mentor-2', name: 'Ana Clara Lima', email: 'ana@demo.sheconnect' },
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'demo-notif-1',
    userId: DEMO_USER_ID,
    title: 'Mentoria confirmada',
    message: 'Ana Clara Lima aceitou sua solicitação de mentoria.',
    type: 'SUCCESS',
    isRead: false,
    createdAt: '2025-11-22T09:30:00.000Z',
  },
  {
    id: 'demo-notif-2',
    userId: DEMO_USER_ID,
    title: 'Novo evento disponível',
    message: 'Startup Day Women 2025 está com inscrições abertas.',
    type: 'INFO',
    isRead: false,
    createdAt: '2025-11-21T14:00:00.000Z',
  },
  {
    id: 'demo-notif-3',
    userId: DEMO_USER_ID,
    title: 'Nova conexão',
    message: 'Fernanda Rocha enviou um pedido de conexão.',
    type: 'INFO',
    isRead: true,
    createdAt: '2025-11-18T11:00:00.000Z',
  },
];

const DEMO_PEER_ID = 'demo-user-mentor-1';
const DEMO_CONVERSATION_ID = 'demo-conversation-1';

export const DEMO_CONVERSATIONS: ChatConversation[] = [
  {
    conversationId: DEMO_CONVERSATION_ID,
    participantIds: [DEMO_USER_ID, DEMO_PEER_ID],
    lastMessage: {
      id: 'demo-msg-2',
      conversationId: DEMO_CONVERSATION_ID,
      senderId: DEMO_PEER_ID,
      receiverId: DEMO_USER_ID,
      message: 'Podemos revisar seu pitch na quinta-feira?',
      read: false,
      createdAt: '2025-11-22T16:45:00.000Z',
    },
    unreadCount: 1,
  },
];

export const DEMO_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'demo-msg-1',
    conversationId: DEMO_CONVERSATION_ID,
    senderId: DEMO_USER_ID,
    receiverId: DEMO_PEER_ID,
    message: 'Olá! Adoraria uma mentoria sobre captação.',
    read: true,
    createdAt: '2025-11-22T16:30:00.000Z',
  },
  {
    id: 'demo-msg-2',
    conversationId: DEMO_CONVERSATION_ID,
    senderId: DEMO_PEER_ID,
    receiverId: DEMO_USER_ID,
    message: 'Podemos revisar seu pitch na quinta-feira?',
    read: false,
    createdAt: '2025-11-22T16:45:00.000Z',
  },
];

export const DEMO_ACTIVE_CHAT_ID = DEMO_CONVERSATION_ID;
