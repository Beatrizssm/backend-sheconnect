import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../../../../application/ports/event-bus.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../../../domains/user/repositories/user.repository.port';
import { RealtimeGateway } from '../../../../../infrastructure/websocket/realtime.gateway';
import { ChatMessageEntity } from '../../../domain/entities/chat-message.entity';
import {
  CHAT_MESSAGE_REPOSITORY,
  ChatMessageRepository,
} from '../../../domain/repositories/chat-message.repository';
import { createConversationId } from '../../chat-conversation-id';

export type SendMessageInput = {
  senderId: string;
  receiverId: string;
  message: string;
};

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CHAT_MESSAGE_REPOSITORY)
    private readonly messages: ChatMessageRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    private readonly realtime: RealtimeGateway,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(input: SendMessageInput): Promise<ChatMessageEntity> {
    if (input.senderId === input.receiverId) {
      throw new BadRequestException('You cannot send a message to yourself.');
    }

    const receiver = await this.users.findById(input.receiverId);
    if (!receiver) {
      throw new NotFoundException('Receiver not found.');
    }

    const message = ChatMessageEntity.create({
      conversationId: createConversationId(input.senderId, input.receiverId),
      senderId: input.senderId,
      receiverId: input.receiverId,
      message: input.message,
    });

    const createdMessage = await this.messages.create(message);
    const payload = createdMessage.toPrimitives();

    await this.auditLogger.log({
      action: 'CHAT_MESSAGE_SENT',
      entity: 'ChatMessage',
      entityId: createdMessage.id,
      userId: input.senderId,
      afterData: {
        conversationId: createdMessage.conversationId,
        messageId: createdMessage.id,
      },
    });

    await this.eventBus.publish('NEW_MESSAGE', {
      userId: input.senderId,
      entityId: createdMessage.id,
      payload,
    });

    this.realtime.emitToUser(input.receiverId, 'chat:new-message', payload);
    this.realtime.emitToUser(input.senderId, 'chat:new-message', payload);

    return createdMessage;
  }
}
