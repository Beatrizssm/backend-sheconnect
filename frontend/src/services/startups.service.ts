import { api } from './api';

export type Startup = {
  id: string;
  founderId: string;
  name: string;
  description: string;
  category: string;
  stage: string;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  pitch: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StartupFilters = {
  category?: string;
  stage?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type StartupPayload = {
  name: string;
  description: string;
  category: string;
  stage: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  pitch?: string;
};

export type PaginatedStartupsResponse = {
  data: Startup[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function removeEmptyFields<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  ) as Partial<T>;
}

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
};
