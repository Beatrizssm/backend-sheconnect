import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { USER_REPOSITORY } from '../domains/user/repositories/user.repository.port';
import { AuditLoggerModule } from '../infrastructure/audit/audit-logger.module';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository';
import { ChatModule } from '../modules/chat/chat.module';
import { EventsModule } from '../modules/events/events.module';
import { JwtAuthModule } from '../modules/auth/jwt-auth.module';
import { MentorshipsModule } from '../modules/mentorships/mentorships.module';
import { NetworkingModule } from '../modules/networking/networking.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { PersistenceModule } from '../modules/persistence.module';
import { StartupsModule } from '../modules/startups/startups.module';
import { ServiceHealthController } from './service-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL_MS ?? 60000),
        limit: Number(process.env.RATE_LIMIT_MAX ?? 100),
      },
    ]),
    AuditLoggerModule,
    JwtAuthModule,
    PersistenceModule,
    ChatModule,
    EventsModule,
    MentorshipsModule,
    NetworkingModule,
    NotificationsModule,
    StartupsModule,
  ],
  controllers: [ServiceHealthController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class AppCoreModule {}
