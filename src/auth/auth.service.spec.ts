import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed_password',
    role: 'OWNER',
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    usersService = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    authService = new AuthService(
      usersService as UsersService,
      jwtService as JwtService,
    );
  });

  describe('validateUser', () => {
    it('should return user data (without passwordHash) when credentials are valid', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeDefined();
      expect(result!.id).toBe('user-1');
      expect(result!.email).toBe('test@example.com');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null when user is not found', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser(
        'test@example.com',
        'wrong_password',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and user payload', () => {
      const loginInput = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'OWNER',
        tenantId: 'tenant-1',
      };

      const result = authService.login(loginInput);

      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.user).toEqual(loginInput);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 'user-1',
        role: 'OWNER',
        tenantId: 'tenant-1',
      });
    });
  });

  describe('register', () => {
    it('should call usersService.create and return user without passwordHash', async () => {
      const registerInput = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
        passwordHash: 'password123',
        role: 'OWNER' as const,
        shopName: 'My Shop',
      };

      (usersService.create as jest.Mock).mockResolvedValue({
        id: 'user-2',
        email: 'new@example.com',
        name: 'New User',
        role: 'OWNER',
        tenantId: 'tenant-2',
        passwordHash: 'hashed',
      });

      const result = await authService.register(registerInput);

      expect(usersService.create).toHaveBeenCalledWith(registerInput);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('new@example.com');
    });
  });
});
