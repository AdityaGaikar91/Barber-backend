import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: EventEmitter2, useValue: {} },
        { provide: SubscriptionsService, useValue: {} },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
