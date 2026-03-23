import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateOfferDto {
  @IsString()
  title: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
