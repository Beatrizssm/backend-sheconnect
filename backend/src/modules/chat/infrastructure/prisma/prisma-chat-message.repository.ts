import { Injectable } from '@nestjs/common';
import { ChatMessage as ChatMessageRecord } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity';
import {
  ChatConversation,
  ChatMessageRepository,
} from '../../domain/repositories/chat-message.repository';

@Injectable()
export class PrismaChatMessageRepository implements ChatMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(message: ChatMessageEntity): Promise<ChatMessageEntity> {
    const primitives = message.toPrimitives();
    const created = await this.prisma.chatMessage.create({
      data: {
        id: primitives.id,
        conversationId: primitives.conversationId,
        senderId: primitives.senderId,
        receiverId: primitives.receiverId,
        message: primitives.message,
        read: primitives.read,
        createdAt: primitives.createdAt,
      },
    });

    return this.toEntity(created);
  }

  async findConversationById(conversationId: string, userId: string): Promise<ChatMessageEntity[]> {
    const records = await this.prisma.chatMessage.findMany({
      where: {
        conversationId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'asc' },
    });

    return records.map((record: ChatMessageRecord) => this.toEntity(record));
  }

  async findById(id: string, userId: string): Promise<ChatMessageEntity | null> {
    const record = await this.prisma.chatMessage.findFirst({
      where: {
        id,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    return record ? this.toEntity(record) : null;
  }

  async findConversations(userId: string): Promise<ChatConversation[]> {
    const records = await this.prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversations = new Map<string, ChatConversation>();

    for (const record of records) {
      if (conversations.has(record.conversationId)) {
        const current = conversations.get(record.conversationId)!;
        if (record.receiverId === userId && !record.read) {
          current.unreadCount += 1;
        }
        continue;
      }

      conversations.set(record.conversationId, {
        conversationId: record.conversationId,
        participantIds: [record.senderId, record.receiverId].sort() as [string, string],
        lastMessage: this.toEntity(record),
        unreadCount: record.receiverId === userId && !record.read ? 1 : 0,
      });
    }

    return Array.from(conversations.values());
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.chatMessage.deleteMany({
      where: {
        id,
        senderId: userId,
      },
    });

    return result.count > 0;
  }

  private toEntity(record: ChatMessageRecord): ChatMessageEntity {
    return ChatMessageEntity.create({
      id: record.id,
      conversationId: record.conversationId,
      senderId: record.senderId,
      receiverId: record.receiverId,
      message: record.message,
      read: record.read,
      createdAt: record.createdAt,
    });
  }
}
