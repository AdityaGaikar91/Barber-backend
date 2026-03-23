import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Only allow OWNER registration on the public endpoint
const ALLOWED_PUBLIC_ROLES = ['OWNER'];

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (!ALLOWED_PUBLIC_ROLES.includes(body.role)) {
      throw new ForbiddenException(
        `Public registration is only allowed for: ${ALLOWED_PUBLIC_ROLES.join(', ')}`,
      );
    }

    const data = {
      ...body,
      passwordHash: body.password,
    };
    const newUser = await this.authService.register(data);

    return this.authService.login({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenantId: newUser.tenantId,
    });
  }
}
