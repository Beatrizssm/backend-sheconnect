import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateStartupDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  @MinLength(2)
  category: string;

  @IsString()
  @MinLength(2)
  stage: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedin?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  instagram?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  pitch?: string;
}
