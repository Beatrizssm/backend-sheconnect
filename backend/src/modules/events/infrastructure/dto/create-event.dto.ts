import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(2)
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
  location?: string;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  meetingLink?: string;

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxAttendees?: number;
}
