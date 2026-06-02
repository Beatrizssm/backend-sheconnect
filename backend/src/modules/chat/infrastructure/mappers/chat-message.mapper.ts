import { ObjectId } from 'mongodb';
import { ChatMessageDocument } from '../../../../infrastructure/mongo/mongo.service';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity';

type ChatMessageResponse = ReturnType<ChatMessageEntity['toPrimitives']>;

export class ChatMessageMapper {
  static toDomain(document: ChatMessageDocument): ChatMessageEntity {
    return ChatMessageEntity.create({
      id: ChatMessageMapper.objectIdToString(document._id),
      conversationId: document.conversationId,
      senderId: document.senderId,
      receiverId: document.receiverId,
      message: document.message,
      read: document.read,
      createdAt: document.createdAt,
    });
  }

  static toPersistence(message: ChatMessageEntity): ChatMessageDocument {
    const primitives = message.toPrimitives();

    return {
      conversationId: primitives.conversationId,
      senderId: primitives.senderId,
      receiverId: primitives.receiverId,
      message: primitives.message,
      read: primitives.read,
      createdAt: primitives.createdAt,
    };
  }

  static toResponse(message: ChatMessageEntity): ChatMessageResponse {
    return message.toPrimitives();
  }

  private static objectIdToString(id: unknown): string | undefined {
    if (id instanceof ObjectId) {
      return id.toHexString();
    }

    return typeof id === 'string' ? id : undefined;
  }
}
