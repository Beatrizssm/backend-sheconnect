import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import {
  CreateNotificationInput,
  NotificationRepository,
} from '../../domain/repositories/notification.repository';
import { NotificationMapper } from '../mappers/notification.mapper';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationInput): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: input,
    });

    return NotificationMapper.toDomain(notification);
  }

  async findManyByUser(userId: string): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(NotificationMapper.toDomain);
  }

  async markAsRead(id: string, userId: string): Promise<NotificationEntity | null> {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return null;
    }

    const notification = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NotificationMapper.toDomain(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.notification.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  }
}
