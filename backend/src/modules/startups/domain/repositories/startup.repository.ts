import { StartupEntity, UpdateStartupProps } from '../entities/startup.entity';

export const STARTUP_REPOSITORY = Symbol('STARTUP_REPOSITORY');

export type StartupListFilters = {
  category?: string;
  stage?: string;
  search?: string;
  page: number;
  limit: number;
};

export type PaginatedStartups = {
  data: StartupEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export interface StartupRepository {
  create(startup: StartupEntity): Promise<StartupEntity>;
  findById(id: string): Promise<StartupEntity | null>;
  findMany(filters: StartupListFilters): Promise<PaginatedStartups>;
  update(id: string, data: UpdateStartupProps): Promise<StartupEntity>;
  delete(id: string): Promise<void>;
}
