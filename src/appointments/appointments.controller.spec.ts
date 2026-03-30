import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
<<<<<<< HEAD
=======
import { AppointmentsService } from './appointments.service';
>>>>>>> development

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
<<<<<<< HEAD
=======
      providers: [{ provide: AppointmentsService, useValue: {} }],
>>>>>>> development
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
