import type { ChatConversation as ApiChatConversation, ChatMessage as ApiChatMessage } from '../../modules/chat';
import type { MentorshipUserSummary } from '../../modules/mentorships';
import type { NetworkingProfile } from '../../modules/networking';
import type { ChatMessage, Connection, Conversation } from '../types/app.types';
import { getShortId } from './date.utils';

export function toChatMessage(message: ApiChatMessage): ChatMessage {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    conversationId: message.conversationId,
    message: message.message,
    createdAt: message.createdAt,
  };
}

export function toConversation(conversation: ApiChatConversation): Conversation {
  return {
    conversationId: conversation.conversationId,
    participantIds: conversation.participantIds,
    lastMessage: toChatMessage(conversation.lastMessage),
    unreadCount: conversation.unreadCount,
  };
}

export function getMentorshipUserName(user: MentorshipUserSummary | undefined, id: string, fallback: string) {
  return user?.name ?? `${fallback} ${getShortId(id)}`;
}

export function toConnection(
  profile: NetworkingProfile,
  options?: { connectedAt?: string; isRecommendation?: boolean },
): Connection {
  const connectedLabel =
    options?.connectedAt ??
    (options?.isRecommendation === false ? 'Conectada' : 'Recomendação');

  return {
    id: profile.id,
    sourceUserId: profile.id,
    name: profile.name,
    role: profile.role === 'MENTOR' ? 'Mentora' : profile.role === 'INVESTOR' ? 'Investidora' : 'Empreendedora',
    specialty: profile.specialty ?? 'Networking',
    connectedAt: connectedLabel,
    avatar: profile.profileImage ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`,
    bio: profile.bio ?? 'Perfil corporativo SheConnect disponível para novas conexões.',
    stats: { mentorias: 0, conexões: 0, startups: 0, eventos: 0 },
    expertise: [profile.specialty ?? 'Comunidade', profile.city ?? 'SheConnect'].filter(Boolean),
  };
}
