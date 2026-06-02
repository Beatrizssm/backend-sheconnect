import { api } from './api';

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

export const notificationsService = {
  async getNotifications(): Promise<Notification[]> {
    const { data } = await api.get<Notification[]>('/notifications');
    return data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
    return data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
