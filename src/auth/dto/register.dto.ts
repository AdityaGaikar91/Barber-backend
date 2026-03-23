import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  role!: 'SUPER_ADMIN' | 'OWNER' | 'EMPLOYEE' | 'CUSTOMER';

  // Required if role is 'OWNER'
  @ValidateIf((o) => o.role === 'OWNER')
  @IsString()
  @IsNotEmpty()
  shopName?: string;

  // Required if role is NOT 'OWNER' or 'SUPER_ADMIN'
  @IsOptional()
  @IsString()
  tenantId?: string;
}
