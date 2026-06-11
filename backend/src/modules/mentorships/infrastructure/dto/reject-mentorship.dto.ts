import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectMentorshipDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
