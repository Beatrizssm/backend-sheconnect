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
