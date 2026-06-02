import { Module } from '@nestjs/common';
import { WebsocketModule } from '../../infrastructure/websocket/websocket.module';
import { PersistenceModule } from '../persistence.module';
import { DomainNotificationHandlerService } from './application/services/domain-notification-handler.service';
import { NotificationsService } from './application/services/notifications.service';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository';
import { NotificationsController } from './infrastructure/controllers/notifications.controller';
import { PrismaNotificationRepository } from './infrastructure/prisma/prisma-notification.repository';

@Module({
  imports: [PersistenceModule, WebsocketModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    DomainNotificationHandlerService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
