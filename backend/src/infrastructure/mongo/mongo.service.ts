import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';

export type ChatMessageDocument = {
  _id?: ObjectId;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export type EventLogDocument = {
  _id?: ObjectId;
  eventType: string;
  userId?: string;
  entityId?: string;
  payload: Record<string, unknown>;
  createdAt: Date;
};

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoService.name);
  private client?: MongoClient;
  private database?: Db;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>(
      'MONGODB_URI',
      'mongodb://sheconnect:sheconnect@localhost:27017/sheconnect?authSource=admin',
    );
    this.client = new MongoClient(url);

    try {
      await this.client.connect();
      this.database = this.client.db(this.configService.get<string>('MONGODB_DATABASE', 'sheconnect'));
      await this.chatMessages.createIndex({ conversationId: 1, createdAt: -1 });
      await this.chatMessages.createIndex({ senderId: 1, receiverId: 1, createdAt: -1 });
      await this.eventLogs.createIndex({ eventType: 1, createdAt: -1 });
      await this.eventLogs.createIndex({ userId: 1, createdAt: -1 });
      await this.eventLogs.createIndex({ entityId: 1, createdAt: -1 });
    } catch (error) {
      this.logger.warn(
        `MongoDB connection unavailable. Continuing without MongoDB. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      await this.client.close();
      this.client = undefined;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.close();
  }

  get eventLogs(): Collection<EventLogDocument> {
    return this.getCollection<EventLogDocument>('event_logs');
  }

  get chatMessages(): Collection<ChatMessageDocument> {
    return this.getCollection<ChatMessageDocument>('chat_messages');
  }

  private getCollection<T extends Record<string, unknown>>(name: string): Collection<T> {
    if (!this.database) {
      throw new Error('MongoDB is not connected.');
    }

    return this.database.collection<T>(name);
  }
}
