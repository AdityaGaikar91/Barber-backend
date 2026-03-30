<<<<<<< HEAD
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
=======
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
>>>>>>> development
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

<<<<<<< HEAD
=======
// Only allow OWNER registration on the public endpoint
const ALLOWED_PUBLIC_ROLES = ['OWNER'];

>>>>>>> development
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

<<<<<<< HEAD
=======
  @Throttle({ default: { limit: 5, ttl: 60000 } })
>>>>>>> development
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

<<<<<<< HEAD
  @Post('register')
  async register(@Body() body: RegisterDto) {
=======
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (!ALLOWED_PUBLIC_ROLES.includes(body.role)) {
      throw new ForbiddenException(
        `Public registration is only allowed for: ${ALLOWED_PUBLIC_ROLES.join(', ')}`,
      );
    }

>>>>>>> development
    const data = {
      ...body,
      passwordHash: body.password,
    };
    const newUser = await this.authService.register(data);

<<<<<<< HEAD
    // Auto-login upon successful registration
=======
>>>>>>> development
    return this.authService.login({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenantId: newUser.tenantId,
    });
  }
}
