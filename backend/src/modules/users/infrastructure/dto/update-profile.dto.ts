import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  professionalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  instagram?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsUrl()
  website?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== undefined)
  profileImage?: string | null;
}
