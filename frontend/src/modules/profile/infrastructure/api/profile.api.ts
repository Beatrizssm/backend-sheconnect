import { api } from '../../../../shared/infrastructure/api/client';
import type {
  RequestVerificationPayload,
  UpdateProfilePayload,
  UserProfile,
} from '../../domain/profile.types';

export const profileService = {
  async getMe(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>('/users/me');
    return data;
  },

  async updateMe(payload: UpdateProfilePayload): Promise<UserProfile> {
    const { data } = await api.patch<UserProfile>('/users/me', payload);
    return data;
  },

  async requestVerification(payload: RequestVerificationPayload): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/users/request-verification', payload);
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const { data } = await api.patch<{ message: string }>('/users/me/password', payload);
    return data;
  },

  async reportUser(userId: string, payload: { reason: string; description?: string }) {
    const { data } = await api.post<{ message: string; reportId: string }>(
      `/users/${userId}/report`,
      payload,
    );
    return data;
  },
};
