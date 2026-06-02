import { ChatMessageEntity } from '../entities/chat-message.entity';

export const CHAT_MESSAGE_REPOSITORY = Symbol('CHAT_MESSAGE_REPOSITORY');

export type ChatConversation = {
  conversationId: string;
  participantIds: [string, string];
  lastMessage: ChatMessageEntity;
  unreadCount: number;
};

export interface ChatMessageRepository {
  create(message: ChatMessageEntity): Promise<ChatMessageEntity>;
  findById(id: string, userId: string): Promise<ChatMessageEntity | null>;
  findConversationById(conversationId: string, userId: string): Promise<ChatMessageEntity[]>;
  findConversations(userId: string): Promise<ChatConversation[]>;
  delete(id: string, userId: string): Promise<boolean>;
}
