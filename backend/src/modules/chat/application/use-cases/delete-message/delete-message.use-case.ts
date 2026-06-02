import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import {
  CHAT_MESSAGE_REPOSITORY,
  ChatMessageRepository,
} from '../../../domain/repositories/chat-message.repository';

@Injectable()
export class DeleteMessageUseCase {
  constructor(
    @Inject(CHAT_MESSAGE_REPOSITORY)
    private readonly messages: ChatMessageRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const message = await this.messages.findById(id, userId);
    const deleted = await this.messages.delete(id, userId);

    if (!deleted || !message) {
      throw new NotFoundException('Message not found.');
    }

    await this.auditLogger.log({
      action: 'CHAT_MESSAGE_DELETED',
      entity: 'ChatMessage',
      entityId: message.id,
      userId,
      beforeData: {
        conversationId: message.conversationId,
        messageId: message.id,
      },
    });
  }
}
