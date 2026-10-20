import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ApplianceController } from './appliance.controller';
import { ApplianceService } from './appliance.service';

describe('ApplianceController', () => {
  let controller: ApplianceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplianceController],
      providers: [
        {
          provide: ApplianceService,
          useValue: {
            getDraftForUser: jest
              .fn<() => Promise<null>>()
              .mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    controller = module.get<ApplianceController>(ApplianceController);
  });

  it('открывает пустую форму, если у текущего пользователя нет черновика', async () => {
    expect(await controller.getDraft(7)).toMatchObject({
      hasDraft: false,
      appliance: null,
    });
  });
});
