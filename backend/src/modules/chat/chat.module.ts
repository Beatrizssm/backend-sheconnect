import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domains/user/repositories/user.repository.port';
import { AuditModule } from '../../infrastructure/audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../../infrastructure/websocket/websocket.module';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PersistenceModule } from '../persistence.module';
import { DeleteMessageUseCase } from './application/use-cases/delete-message/delete-message.use-case';
import { GetConversationMessagesUseCase } from './application/use-cases/get-conversation-messages/get-conversation-messages.use-case';
import { ListConversationsUseCase } from './application/use-cases/list-conversations/list-conversations.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message/send-message.use-case';
import { CHAT_MESSAGE_REPOSITORY } from './domain/repositories/chat-message.repository';
import { ChatController } from './infrastructure/controllers/chat.controller';
import { PrismaChatMessageRepository } from './infrastructure/prisma/prisma-chat-message.repository';

@Module({
  imports: [PersistenceModule, WebsocketModule, AuditModule, AuthModule],
  controllers: [ChatController],
  providers: [
    SendMessageUseCase,
    ListConversationsUseCase,
    GetConversationMessagesUseCase,
    DeleteMessageUseCase,
    {
      provide: CHAT_MESSAGE_REPOSITORY,
      useClass: PrismaChatMessageRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class ChatModule {}
