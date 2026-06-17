import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domains/user/repositories/user.repository.port';
import { AuditLoggerModule } from '../../infrastructure/audit/audit-logger.module';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { PersistenceModule } from '../persistence.module';
import { ChangeConnectionStatusUseCase } from './application/use-cases/change-connection-status.use-case';
import { ConnectUserUseCase } from './application/use-cases/connect-user.use-case';
import { ListMyConnectionsUseCase } from './application/use-cases/list-my-connections.use-case';
import { NETWORKING_REPOSITORY } from './domain/repositories/networking.repository';
import { NetworkingController } from './infrastructure/networking.controller';
import { PrismaNetworkingRepository } from './infrastructure/prisma/prisma-networking.repository';

@Module({
  imports: [PersistenceModule, AuditLoggerModule, JwtAuthModule],
  controllers: [NetworkingController],
  providers: [
    ConnectUserUseCase,
    ChangeConnectionStatusUseCase,
    ListMyConnectionsUseCase,
    {
      provide: NETWORKING_REPOSITORY,
      useClass: PrismaNetworkingRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class NetworkingModule {}
