import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
<<<<<<< HEAD
=======
import { ServicesService } from './services.service';
>>>>>>> development

describe('ServicesController', () => {
  let controller: ServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
<<<<<<< HEAD
=======
      providers: [{ provide: ServicesService, useValue: {} }],
>>>>>>> development
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
