import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { MentorshipStatus } from '../../domain/entities/mentorship.entity';

export class UpdateMentorshipStatusDto {
  @IsOptional()
  @IsEnum(MentorshipStatus)
  status?: MentorshipStatus;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
