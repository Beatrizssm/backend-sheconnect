import { api } from '../../../../shared/infrastructure/api/client';
import type { Notification } from '../../domain/notification.types';

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
