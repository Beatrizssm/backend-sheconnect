import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateMentorshipDto {
  @IsUUID()
  mentorId: string;

  @IsOptional()
  @IsUUID()
  startupId?: string;

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  @MinLength(2)
  category: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  mentorshipArea?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  initialMessage?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
