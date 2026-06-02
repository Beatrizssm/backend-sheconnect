import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { MongoModule } from '../infrastructure/mongo/mongo.module';
import { MessagingModule } from '../infrastructure/messaging/messaging.module';

@Module({
  imports: [DatabaseModule, MongoModule, MessagingModule],
  exports: [DatabaseModule, MongoModule, MessagingModule],
})
export class PersistenceModule {}
