export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
};
