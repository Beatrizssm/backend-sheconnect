import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUDIT_LOGGER } from '../../application/ports/audit-log.port';
import { DatabaseModule } from '../database/database.module';
import { MessagingPublisherModule } from '../messaging/messaging-publisher.module';
import { PrismaAuditLoggerService } from './prisma-audit-logger.service';
import { RabbitAuditLoggerService } from './rabbit-audit-logger.service';

const isPublisherService = (): boolean => {
  const serviceName = process.env.SERVICE_NAME ?? 'monolith';
  return serviceName === 'iam' || serviceName === 'core';
};

@Global()
@Module({
  imports: [DatabaseModule, ...(isPublisherService() ? [MessagingPublisherModule] : [])],
  providers: [
    PrismaAuditLoggerService,
    ...(isPublisherService() ? [RabbitAuditLoggerService] : []),
    {
      provide: AUDIT_LOGGER,
      useFactory: (
        configService: ConfigService,
        prismaLogger: PrismaAuditLoggerService,
        rabbitLogger?: RabbitAuditLoggerService,
      ) => {
        const serviceName = configService.get<string>('SERVICE_NAME', 'monolith');
        return serviceName === 'iam' || serviceName === 'core' ? rabbitLogger! : prismaLogger;
      },
      inject: isPublisherService()
        ? [ConfigService, PrismaAuditLoggerService, RabbitAuditLoggerService]
        : [ConfigService, PrismaAuditLoggerService],
    },
  ],
  exports: [AUDIT_LOGGER],
})
export class AuditLoggerModule {}
