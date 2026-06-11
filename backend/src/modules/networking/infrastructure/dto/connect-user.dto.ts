import { IsUUID } from 'class-validator';

export class ConnectUserDto {
  @IsUUID()
  receiverId: string;
}
