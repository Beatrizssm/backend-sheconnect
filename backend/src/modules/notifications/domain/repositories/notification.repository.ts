import { NotificationType } from '@prisma/client';
import { NotificationEntity } from '../entities/notification.entity';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
};

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<NotificationEntity>;
  findManyByUser(userId: string): Promise<NotificationEntity[]>;
  markAsRead(id: string, userId: string): Promise<NotificationEntity | null>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string, userId: string): Promise<boolean>;
}
