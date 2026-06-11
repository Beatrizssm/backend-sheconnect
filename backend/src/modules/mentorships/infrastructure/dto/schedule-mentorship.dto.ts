import { IsDateString } from 'class-validator';

export class ScheduleMentorshipDto {
  @IsDateString()
  scheduledAt: string;
}
