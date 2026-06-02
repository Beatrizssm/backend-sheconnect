import { Notification } from '@prisma/client';
import { NotificationEntity } from '../../domain/entities/notification.entity';

export class NotificationMapper {
  static toDomain(notification: Notification): NotificationEntity {
    return NotificationEntity.create({
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });
  }

  static toResponse(notification: NotificationEntity) {
    return notification.toPrimitives();
  }
}
