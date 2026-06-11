import { api } from '../../../../shared/infrastructure/api/client';
import type { EventsResponse } from '../../domain/event.types';

export const eventsService = {
  async getEvents(): Promise<EventsResponse> {
    const { data } = await api.get<EventsResponse>('/events');
    return data;
  },

  async register(eventId: string): Promise<void> {
    await api.post(`/events/${eventId}/register`);
  },
};
