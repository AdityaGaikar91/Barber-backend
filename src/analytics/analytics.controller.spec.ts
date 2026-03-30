import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
<<<<<<< HEAD
=======
import { AnalyticsService } from './analytics.service';
>>>>>>> development

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
<<<<<<< HEAD
=======
      providers: [{ provide: AnalyticsService, useValue: {} }],
>>>>>>> development
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
