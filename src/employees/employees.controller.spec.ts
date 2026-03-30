import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
<<<<<<< HEAD
=======
import { EmployeesService } from './employees.service';
>>>>>>> development

describe('EmployeesController', () => {
  let controller: EmployeesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
<<<<<<< HEAD
=======
      providers: [{ provide: EmployeesService, useValue: {} }],
>>>>>>> development
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
