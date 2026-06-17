import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { MongoModule } from '../infrastructure/mongo/mongo.module';
import { MessagingModule } from '../infrastructure/messaging/messaging.module';
import { MessagingConsumerModule } from '../infrastructure/messaging/messaging-consumer.module';
import { MessagingDataModule } from '../infrastructure/messaging/messaging-data.module';
import { MessagingPublisherModule } from '../infrastructure/messaging/messaging-publisher.module';

const serviceName = process.env.SERVICE_NAME ?? 'monolith';

const messagingImports =
  serviceName === 'iam' || serviceName === 'core'
    ? [MessagingPublisherModule]
    : serviceName === 'audit'
      ? [MessagingConsumerModule]
      : serviceName === 'data'
        ? [MessagingDataModule]
        : [MessagingModule];

const mongoImports = serviceName === 'data' || serviceName === 'monolith' ? [MongoModule] : [];

@Module({
  imports: [DatabaseModule, ...mongoImports, ...messagingImports],
  exports: [DatabaseModule, ...mongoImports, ...messagingImports],
})
export class PersistenceModule {}
