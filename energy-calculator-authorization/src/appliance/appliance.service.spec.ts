import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ApplianceService } from './appliance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appliance } from '../entities/appliance.entity';

describe('ApplianceService', () => {
  let service: ApplianceService;
  const repository = {
    findOneBy: jest.fn<() => Promise<object>>(),
    query: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplianceService,
        { provide: getRepositoryToken(Appliance), useValue: repository },
      ],
    }).compile();

    service = module.get<ApplianceService>(ApplianceService);
  });

  it('запрещает SSR-удаление чужого прибора до SQL UPDATE', async () => {
    repository.findOneBy.mockResolvedValue({
      applianceId: 1,
      creatorId: 2,
      publicationStatus: 'published',
    });
    await expect(service.deleteApplianceRaw(1, 7)).rejects.toMatchObject({
      status: 403,
    });
    expect(repository.query).not.toHaveBeenCalled();
  });

  it('ограничивает SQL UPDATE создателем из сессии', async () => {
    repository.findOneBy.mockResolvedValue({
      applianceId: 1,
      creatorId: 7,
      publicationStatus: 'published',
    });
    await service.deleteApplianceRaw(1, 7);
    expect(repository.query).toHaveBeenCalledWith(
      expect.stringContaining('creator_id = $2'),
      [1, 7],
    );
  });
});
