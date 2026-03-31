import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
