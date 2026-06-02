import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateMentorshipDto {
  @IsUUID()
  mentorId: string;

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  @MinLength(2)
  category: string;
}
