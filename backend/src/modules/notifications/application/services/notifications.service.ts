import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { RealtimeGateway } from '../../../../infrastructure/websocket/realtime.gateway';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '../../domain/repositories/notification.repository';

export type CreateNotificationCommand = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
};

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
    private readonly realtime: RealtimeGateway,
  ) {}

  findMany(userId: string): Promise<NotificationEntity[]> {
    return this.notifications.findManyByUser(userId);
  }

  async create(input: CreateNotificationCommand): Promise<NotificationEntity> {
    const notification = await this.notifications.create({
      ...input,
      type: input.type ?? NotificationType.INFO,
    });
    const payload = notification.toPrimitives();

    this.realtime.emitToUser(input.userId, 'notification:new', {
      id: payload.id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      isRead: payload.isRead,
      createdAt: payload.createdAt,
    });

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<NotificationEntity> {
    const notification = await this.notifications.markAsRead(id, userId);

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    return notification;
  }

  markAllAsRead(userId: string): Promise<void> {
    return this.notifications.markAllAsRead(userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const deleted = await this.notifications.delete(id, userId);

    if (!deleted) {
      throw new NotFoundException('Notification not found.');
    }
  }
}
