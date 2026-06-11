import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedUser } from '../../../auth/jwt.strategy';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { JwtGuard } from '../../../auth/jwt.guard';
import { VerifiedUserGuard } from '../../../auth/verified-user.guard';
import { DeleteMessageUseCase } from '../../application/use-cases/delete-message/delete-message.use-case';
import { GetConversationMessagesUseCase } from '../../application/use-cases/get-conversation-messages/get-conversation-messages.use-case';
import { ListConversationsUseCase } from '../../application/use-cases/list-conversations/list-conversations.use-case';
import { SendMessageUseCase } from '../../application/use-cases/send-message/send-message.use-case';
import { CreateChatMessageDto } from '../dto/create-chat-message.dto';
import { ChatMessageMapper } from '../mappers/chat-message.mapper';

@UseGuards(JwtGuard, VerifiedUserGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly sendMessage: SendMessageUseCase,
    private readonly listConversations: ListConversationsUseCase,
    private readonly getMessages: GetConversationMessagesUseCase,
    private readonly deleteMessage: DeleteMessageUseCase,
  ) {}

  @Post('messages')
  async create(@Body() dto: CreateChatMessageDto, @CurrentUser() user: AuthenticatedUser) {
    const message = await this.sendMessage.execute({
      senderId: user.id,
      receiverId: dto.receiverId,
      message: dto.message,
    });

    return ChatMessageMapper.toResponse(message);
  }

  @Get('conversations')
  async conversations(@CurrentUser() user: AuthenticatedUser) {
    const conversations = await this.listConversations.execute(user.id);

    return conversations.map((conversation) => ({
      conversationId: conversation.conversationId,
      participantIds: conversation.participantIds,
      lastMessage: ChatMessageMapper.toResponse(conversation.lastMessage),
      unreadCount: conversation.unreadCount,
    }));
  }

  @Get('messages/:conversationId')
  async messages(@Param('conversationId') conversationId: string, @CurrentUser() user: AuthenticatedUser) {
    const messages = await this.getMessages.execute(conversationId, user.id);
    return messages.map(ChatMessageMapper.toResponse);
  }

  @Delete('messages/:id')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.deleteMessage.execute(id, user.id);
    return { message: 'Message deleted successfully.' };
  }
}
