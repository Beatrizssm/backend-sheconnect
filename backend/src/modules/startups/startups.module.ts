import { Module } from '@nestjs/common';
import { AuditLoggerModule } from '../../infrastructure/audit/audit-logger.module';
import { PersistenceModule } from '../persistence.module';
import { CreateStartupUseCase } from './application/use-cases/create-startup/create-startup.use-case';
import { DeleteStartupUseCase } from './application/use-cases/delete-startup/delete-startup.use-case';
import { FavoriteStartupUseCase } from './application/use-cases/favorite-startup/favorite-startup.use-case';
import { GetStartupUseCase } from './application/use-cases/get-startup/get-startup.use-case';
import { ListFavoriteStartupsUseCase } from './application/use-cases/list-favorite-startups/list-favorite-startups.use-case';
import { ListStartupsUseCase } from './application/use-cases/list-startups/list-startups.use-case';
import { UnfavoriteStartupUseCase } from './application/use-cases/unfavorite-startup/unfavorite-startup.use-case';
import { UpdateStartupUseCase } from './application/use-cases/update-startup/update-startup.use-case';
import { STARTUP_REPOSITORY } from './domain/repositories/startup.repository';
import { StartupsController } from './infrastructure/controllers/startups.controller';
import { PrismaStartupRepository } from './infrastructure/prisma/prisma-startup.repository';

@Module({
  imports: [PersistenceModule, AuditLoggerModule],
  controllers: [StartupsController],
  providers: [
    CreateStartupUseCase,
    ListStartupsUseCase,
    ListFavoriteStartupsUseCase,
    FavoriteStartupUseCase,
    UnfavoriteStartupUseCase,
    GetStartupUseCase,
    UpdateStartupUseCase,
    DeleteStartupUseCase,
    {
      provide: STARTUP_REPOSITORY,
      useClass: PrismaStartupRepository,
    },
  ],
})
export class StartupsModule {}
