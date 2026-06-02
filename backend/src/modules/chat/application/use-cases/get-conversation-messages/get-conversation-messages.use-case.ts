import { Inject, Injectable } from '@nestjs/common';
import { ChatMessageEntity } from '../../../domain/entities/chat-message.entity';
import {
  CHAT_MESSAGE_REPOSITORY,
  ChatMessageRepository,
} from '../../../domain/repositories/chat-message.repository';

@Injectable()
export class GetConversationMessagesUseCase {
  constructor(
    @Inject(CHAT_MESSAGE_REPOSITORY)
    private readonly messages: ChatMessageRepository,
  ) {}

  execute(conversationId: string, userId: string): Promise<ChatMessageEntity[]> {
    return this.messages.findConversationById(conversationId, userId);
  }
}
