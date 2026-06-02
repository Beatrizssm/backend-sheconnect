import { NotificationType } from '@prisma/client';

export type NotificationProps = {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead?: boolean;
  createdAt?: Date;
};

export class NotificationEntity {
  private constructor(private readonly props: Required<NotificationProps>) {}

  static create(props: NotificationProps): NotificationEntity {
    return new NotificationEntity({
      id: props.id ?? crypto.randomUUID(),
      userId: props.userId,
      title: props.title.trim(),
      message: props.message.trim(),
      type: props.type,
      isRead: props.isRead ?? false,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  toPrimitives(): Required<NotificationProps> {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }
}
