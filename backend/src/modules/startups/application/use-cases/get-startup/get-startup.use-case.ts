import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { StartupEntity } from '../../../domain/entities/startup.entity';
import {
  STARTUP_REPOSITORY,
  StartupRepository,
} from '../../../domain/repositories/startup.repository';

@Injectable()
export class GetStartupUseCase {
  constructor(
    @Inject(STARTUP_REPOSITORY)
    private readonly startups: StartupRepository,
  ) {}

  async execute(id: string): Promise<StartupEntity> {
    const startup = await this.startups.findById(id);

    if (!startup) {
      throw new NotFoundException('Startup not found.');
    }

    return startup;
  }
}
