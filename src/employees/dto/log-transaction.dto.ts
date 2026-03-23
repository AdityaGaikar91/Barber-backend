import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LogTransactionDto {
  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsNumber()
  amount!: number;
}
