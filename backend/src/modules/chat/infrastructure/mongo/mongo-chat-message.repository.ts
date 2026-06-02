import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { MongoService } from '../../../../infrastructure/mongo/mongo.service';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity';
import {
  ChatConversation,
  ChatMessageRepository,
} from '../../domain/repositories/chat-message.repository';
import { ChatMessageMapper } from '../mappers/chat-message.mapper';

@Injectable()
export class MongoChatMessageRepository implements ChatMessageRepository {
  constructor(private readonly mongo: MongoService) {}

  async create(message: ChatMessageEntity): Promise<ChatMessageEntity> {
    const result = await this.mongo.chatMessages.insertOne(ChatMessageMapper.toPersistence(message));
    const created = await this.mongo.chatMessages.findOne({ _id: result.insertedId });

    return ChatMessageMapper.toDomain(created ?? { ...ChatMessageMapper.toPersistence(message), _id: result.insertedId });
  }

  async findConversationById(conversationId: string, userId: string): Promise<ChatMessageEntity[]> {
    const documents = await this.mongo.chatMessages
      .find({
        conversationId,
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .sort({ createdAt: 1 })
      .toArray();

    return documents.map(ChatMessageMapper.toDomain);
  }

  async findById(id: string, userId: string): Promise<ChatMessageEntity | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const document = await this.mongo.chatMessages.findOne({
      _id: new ObjectId(id),
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    return document ? ChatMessageMapper.toDomain(document) : null;
  }

  async findConversations(userId: string): Promise<ChatConversation[]> {
    const documents = await this.mongo.chatMessages
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .sort({ createdAt: -1 })
      .toArray();

    const conversations = new Map<string, ChatConversation>();

    for (const document of documents) {
      if (conversations.has(document.conversationId)) {
        const current = conversations.get(document.conversationId)!;
        if (document.receiverId === userId && !document.read) {
          current.unreadCount += 1;
        }
        continue;
      }

      conversations.set(document.conversationId, {
        conversationId: document.conversationId,
        participantIds: [document.senderId, document.receiverId].sort() as [string, string],
        lastMessage: ChatMessageMapper.toDomain(document),
        unreadCount: document.receiverId === userId && !document.read ? 1 : 0,
      });
    }

    return Array.from(conversations.values());
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await this.mongo.chatMessages.deleteOne({
      _id: new ObjectId(id),
      senderId: userId,
    });

    return result.deletedCount > 0;
  }
}
