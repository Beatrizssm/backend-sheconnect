import { api } from '../../../../shared/infrastructure/api/client';
import type { NetworkingResult, UserConnection } from '../../domain/networking.types';

export const networkingService = {
  async getMyConnections(): Promise<NetworkingResult> {
    const { data } = await api.get<NetworkingResult>('/networking/my-connections');
    return data;
  },

  async connect(receiverId: string): Promise<UserConnection> {
    const { data } = await api.post<UserConnection>('/networking/connect', { receiverId });
    return data;
  },

  async accept(id: string): Promise<UserConnection> {
    const { data } = await api.patch<UserConnection>(`/networking/${id}/accept`);
    return data;
  },
};
