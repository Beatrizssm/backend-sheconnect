import { api } from './api';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type ChatConversation = {
  conversationId: string;
  participantIds: [string, string];
  lastMessage: ChatMessage;
  unreadCount: number;
};

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
