import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MentorshipStatus } from '../../domain/entities/mentorship.entity';

export class UpdateMentorshipStatusDto {
  @IsOptional()
  @IsEnum(MentorshipStatus)
  status?: MentorshipStatus;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
