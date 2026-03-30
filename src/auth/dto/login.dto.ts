import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
<<<<<<< HEAD
=======
  @MinLength(6)
>>>>>>> development
  password!: string;
}
