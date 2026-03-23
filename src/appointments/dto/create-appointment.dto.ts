import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEmail,
  IsOptional,
  IsDateString,
  MinLength,
  IsArray,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  tenantSlug: string; // The public URL identifier for the barbershop

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  customerName: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsNotEmpty()
  @IsArray()
  @IsUUID('all', { each: true })
  serviceIds: string[];

  @IsNotEmpty()
  @IsUUID()
  employeeId: string;

  @IsNotEmpty()
  @IsDateString()
  appointmentTime: string; // ISO String
}

export class UpdateAppointmentStatusDto {
  @IsNotEmpty()
  @IsString()
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
}
