import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateChatMessageDto {
  @IsUUID()
  receiverId: string;

  @IsString()
  @MinLength(1)
  message: string;
}
