import type {
  CreateMentorshipPayload,
  Mentorship as ApiMentorship,
  MentorshipStatus,
  MentorshipUserSummary,
} from '../../modules/mentorships';
import type { Startup as ApiStartup, StartupPayload } from '../../modules/startups';
import type { SheConnectEvent } from '../../modules/events';
import type { ChatMessage as ApiChatMessage, ChatConversation as ApiChatConversation } from '../../modules/chat';

export type UserRole = 'entrepreneur' | 'mentor' | 'investor';
export type ApiRole = 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTOR';
export type AuthView = 'home' | 'login' | 'signup' | 'forgot-password' | 'app';
export type AppTab =
  | 'dashboard'
  | 'startups'
  | 'mentorias'
  | 'eventos'
  | 'conexões'
  | 'chat'
  | 'notificações'
  | 'usuarios'
  | 'analytics';
export type StartupMode = 'list' | 'create' | 'edit';
export type MentorshipMode = 'list' | 'schedule';
export type EventMode = 'list' | 'detail';
export type ConnectionMode = 'list' | 'profile';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  conversationId: string;
  createdAt: string;
}

export interface Conversation {
  conversationId: string;
  participantIds: [string, string];
  lastMessage: ChatMessage;
  unreadCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  type: string;
  status: 'Ativo' | 'Inativo';
}

export interface Connection {
  id: string;
  sourceUserId?: string;
  name: string;
  role: string;
  specialty: string;
  connectedAt: string;
  avatar: string;
  bio: string;
  stats: {
    mentorias: number;
    conexões: number;
    startups: number;
    eventos: number;
  };
  expertise: string[];
}

export type Startup = ApiStartup;
export type StartupFormState = StartupPayload;
export type Mentorship = ApiMentorship;
export type MentorshipFormState = CreateMentorshipPayload;
export type Event = SheConnectEvent;

export type JwtPayload = {
  sub?: string;
  role?: ApiRole;
};

export interface Mentor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  availability: string;
  avatar: string;
}

export type { ApiChatMessage, ApiChatConversation, MentorshipUserSummary, MentorshipStatus };
