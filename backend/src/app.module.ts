import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { USER_REPOSITORY } from './domains/user/repositories/user.repository.port';
import { AuditModule } from './infrastructure/audit/audit.module';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { HealthController } from './interfaces/controllers/health.controller';
import { MetricsController } from './interfaces/controllers/metrics.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { EventsModule } from './modules/events/events.module';
import { MentorshipsModule } from './modules/mentorships/mentorships.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PersistenceModule } from './modules/persistence.module';
import { StartupsModule } from './modules/startups/startups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ChatModule,
    EventsModule,
    MetricsModule,
    NotificationsModule,
    StartupsModule,
    MentorshipsModule,
    PersistenceModule,
    AuditModule,
  ],
  controllers: [MetricsController, HealthController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class AppModule {}
