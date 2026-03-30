import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
<<<<<<< HEAD
=======
import { AuthService } from './auth.service';
>>>>>>> development

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
<<<<<<< HEAD
=======
      providers: [{ provide: AuthService, useValue: {} }],
>>>>>>> development
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
