import { IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';

export class RequestVerificationDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  professionalInstagram?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsUrl()
  companyWebsite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
