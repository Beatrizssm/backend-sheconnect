import { api } from '../../../../shared/infrastructure/api/client';

import { removeEmptyFields } from '../../../../shared/utils/payload.utils';

import type {

  CreateMentorshipPayload,

  Mentorship,

  MentorshipFilters,

  MentorshipUserSummary,

} from '../../domain/mentorship.types';



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

    const { data } = await api.post<Mentorship>('/mentorships/request', removeEmptyFields(payload));

    return data;

  },



  async acceptMentorship(id: string, payload: { scheduledAt?: string } = {}): Promise<Mentorship> {

    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/accept`, removeEmptyFields(payload));

    return data;

  },



  async rejectMentorship(id: string, payload: { rejectionReason?: string } = {}): Promise<Mentorship> {

    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/reject`, removeEmptyFields(payload));

    return data;

  },



  async scheduleMentorship(id: string, scheduledAt: string): Promise<Mentorship> {

    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/schedule`, { scheduledAt });

    return data;

  },



  async startMentorship(id: string): Promise<Mentorship> {

    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/start`, {});

    return data;

  },



  async completeMentorship(

    id: string,

    payload: { feedback?: string; rating?: number } = {},

  ): Promise<Mentorship> {

    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/finish`, removeEmptyFields(payload));

    return data;

  },



  async cancelMentorship(id: string): Promise<Mentorship> {

    const { data } = await api.patch<Mentorship>(`/mentorships/${id}/cancel`, {});

    return data;

  },

};


