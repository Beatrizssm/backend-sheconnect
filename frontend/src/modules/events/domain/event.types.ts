export type SheConnectEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  type?: string | null;
  speaker?: string | null;
  location: string | null;
  isOnline: boolean;
  meetingLink: string | null;
  eventDate: string;
  maxAttendees: number | null;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
};

export type EventsResponse = {
  data: SheConnectEvent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
