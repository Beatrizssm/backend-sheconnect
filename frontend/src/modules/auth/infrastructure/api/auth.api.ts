import { api } from '../../../../shared/infrastructure/api/client';
import type { AuthUser } from '../../domain/auth.types';

export const authService = {
  async getMe(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me');
    return data;
  },
};
