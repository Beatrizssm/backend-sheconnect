import { api } from '../../../../shared/infrastructure/api/client';
import type { ChatConversation, ChatMessage } from '../../domain/chat.types';

export const chatService = {
  async getConversations(): Promise<ChatConversation[]> {
    const { data } = await api.get<ChatConversation[]>('/chat/conversations');
    return data;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/chat/messages/${conversationId}`);
    return data;
  },

  async sendMessage(receiverId: string, message: string): Promise<ChatMessage> {
    const { data } = await api.post<ChatMessage>('/chat/messages', { receiverId, message });
    return data;
  },
};
