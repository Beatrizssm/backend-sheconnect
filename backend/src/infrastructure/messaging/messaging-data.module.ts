import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MongoModule } from '../mongo/mongo.module';
import { AnalyticsConsumer } from './analytics.consumer';
import { EventLogConsumer } from './event-log.consumer';
import { MessagingConsumerModule } from './messaging-consumer.module';

@Module({
  imports: [MongoModule, DatabaseModule, MessagingConsumerModule],
  providers: [EventLogConsumer, AnalyticsConsumer],
})
export class MessagingDataModule {}
