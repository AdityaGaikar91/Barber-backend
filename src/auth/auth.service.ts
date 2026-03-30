import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

<<<<<<< HEAD
=======
export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

>>>>>>> development
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

<<<<<<< HEAD
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
=======
  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
>>>>>>> development
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

<<<<<<< HEAD
  async login(user: {
=======
  login(user: {
>>>>>>> development
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string | null;
  }) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(data: RegisterDto & { passwordHash: string }) {
    const user = await this.usersService.create(data);
<<<<<<< HEAD
=======
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
>>>>>>> development
    const { passwordHash, ...result } = user;
    return result;
  }
}
