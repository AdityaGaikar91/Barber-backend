import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateTenantSettingsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsObject()
  businessHours?: Record<string, any>;
}
