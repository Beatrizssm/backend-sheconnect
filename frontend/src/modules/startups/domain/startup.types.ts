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
