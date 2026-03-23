import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price!: number;

  @IsNumber()
  duration!: number;

  @IsOptional()
  @IsString()
  category?: string;
}
