import { Inject, Injectable } from '@nestjs/common';
import {
  CHAT_MESSAGE_REPOSITORY,
  ChatConversation,
  ChatMessageRepository,
} from '../../../domain/repositories/chat-message.repository';

@Injectable()
export class ListConversationsUseCase {
  constructor(
    @Inject(CHAT_MESSAGE_REPOSITORY)
    private readonly messages: ChatMessageRepository,
  ) {}

  execute(userId: string): Promise<ChatConversation[]> {
    return this.messages.findConversations(userId);
  }
}
