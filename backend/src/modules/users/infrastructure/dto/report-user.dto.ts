import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportReason } from '../../domain/enums/report-reason.enum';

export class ReportUserDto {
  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
