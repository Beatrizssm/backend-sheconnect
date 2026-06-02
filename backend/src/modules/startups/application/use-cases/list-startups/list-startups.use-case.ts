import { Inject, Injectable } from '@nestjs/common';
import {
  PaginatedStartups,
  STARTUP_REPOSITORY,
  StartupListFilters,
  StartupRepository,
} from '../../../domain/repositories/startup.repository';

@Injectable()
export class ListStartupsUseCase {
  constructor(
    @Inject(STARTUP_REPOSITORY)
    private readonly startups: StartupRepository,
  ) {}

  execute(filters: StartupListFilters): Promise<PaginatedStartups> {
    return this.startups.findMany(filters);
  }
}
