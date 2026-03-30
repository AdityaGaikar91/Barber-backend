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
<<<<<<< HEAD
  @ValidateIf((o) => o.role === 'OWNER')
=======
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o: any) => o.role === 'OWNER')
>>>>>>> development
  @IsString()
  @IsNotEmpty()
  shopName?: string;

  // Required if role is NOT 'OWNER' or 'SUPER_ADMIN'
  @IsOptional()
  @IsString()
  tenantId?: string;
}
