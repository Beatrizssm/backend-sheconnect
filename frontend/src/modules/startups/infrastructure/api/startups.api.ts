import { api } from '../../../../shared/infrastructure/api/client';
import { removeEmptyFields } from '../../../../shared/utils/payload.utils';
import type {
  PaginatedStartupsResponse,
  Startup,
  StartupFilters,
  StartupPayload,
} from '../../domain/startup.types';

export const startupsService = {
  async getStartups(filters: StartupFilters = {}): Promise<PaginatedStartupsResponse> {
    const { data } = await api.get<PaginatedStartupsResponse>('/startups', {
      params: removeEmptyFields(filters),
    });

    return data;
  },

  async getStartupById(id: string): Promise<Startup> {
    const { data } = await api.get<Startup>(`/startups/${id}`);
    return data;
  },

  async createStartup(payload: StartupPayload): Promise<Startup> {
    const { data } = await api.post<Startup>('/startups', removeEmptyFields(payload));
    return data;
  },

  async updateStartup(id: string, payload: Partial<StartupPayload>): Promise<Startup> {
    const { data } = await api.patch<Startup>(`/startups/${id}`, removeEmptyFields(payload));
    return data;
  },

  async deleteStartup(id: string): Promise<void> {
    await api.delete(`/startups/${id}`);
  },

  async getFavoriteStartups(): Promise<Startup[]> {
    const { data } = await api.get<Startup[]>('/startups/favorites/my');
    return data;
  },

  async favoriteStartup(id: string): Promise<void> {
    await api.post(`/startups/${id}/favorite`);
  },

  async unfavoriteStartup(id: string): Promise<void> {
    await api.delete(`/startups/${id}/favorite`);
  },
};
