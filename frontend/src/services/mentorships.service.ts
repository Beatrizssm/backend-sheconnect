import { api } from './api';

export type MentorshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export type MentorshipUserSummary = {
  id: string;
  name: string;
  email: string;
};

export type Mentorship = {
  id: string;
  entrepreneurId: string;
  mentorId: string;
  title: string;
  description: string;
  category: string;
  status: MentorshipStatus;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  mentor?: MentorshipUserSummary;
  entrepreneur?: MentorshipUserSummary;
};

export type MentorshipFilters = {
  status?: MentorshipStatus | '';
  category?: string;
};

export type CreateMentorshipPayload = {
  mentorId: string;
  title: string;
  description: string;
  category: string;
};

function removeEmptyFields<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  ) as Partial<T>;
}

export const mentorshipsService = {
  async getMentorships(filters: MentorshipFilters = {}): Promise<Mentorship[]> {
    const { data } = await api.get<Mentorship[]>('/mentorships', {
      params: removeEmptyFields(filters),
    });

    return data;
  },

  async getMentorshipById(id: string): Promise<Mentorship> {
    const { data } = await api.get<Mentorship>(`/mentorships/${id}`);
    return data;
  },

  async getMentors(): Promise<MentorshipUserSummary[]> {
    const { data } = await api.get<MentorshipUserSummary[]>('/mentorships/mentors');
    return data;
  },

  async createMentorship(payload: CreateMentorshipPayload): Promise<Mentorship> {
    const { data } = await api.post<Mentorship>('/mentorships', removeEmptyFields(payload));
    return data;
  },

  async acceptMentorship(id: string): Promise<Mentorship> {
    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/accept`, {});
    return data;
  },

  async rejectMentorship(id: string): Promise<Mentorship> {
    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/reject`, {});
    return data;
  },

  async completeMentorship(id: string): Promise<Mentorship> {
    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/complete`, {});
    return data;
  },

  async cancelMentorship(id: string): Promise<Mentorship> {
    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/cancel`, {});
    return data;
  },
};
