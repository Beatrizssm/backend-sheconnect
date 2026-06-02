import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MentorshipStatus } from '../../domain/entities/mentorship.entity';

export class ListMentorshipsQueryDto {
  @IsOptional()
  @IsEnum(MentorshipStatus)
  status?: MentorshipStatus;

  @IsOptional()
  @IsString()
  category?: string;
}
