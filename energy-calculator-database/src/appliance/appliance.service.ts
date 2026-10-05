import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appliance } from '../entities/appliance.entity';

@Injectable()
export class ApplianceService {
  private static readonly DEFAULT_IMAGE = '/media/default.png';
  private static readonly DEFAULT_VIDEO = '/media/default.mp4';

  constructor(
    @InjectRepository(Appliance)
    private readonly applianceRepository: Repository<Appliance>,
  ) {}

  private formatAppliance(appliance: Appliance) {
    const likesArray = appliance.likes || [];

    return {
      ...appliance,
      id: appliance.applianceId,
      deviceName: appliance.applianceName,
      description: appliance.applianceDescription,
      imageUrl:
        appliance.imageUrl && appliance.imageUrl.trim() !== ''
          ? appliance.imageUrl
          : ApplianceService.DEFAULT_IMAGE,
      videoUrl:
        appliance.videoUrl && appliance.videoUrl.trim() !== ''
          ? appliance.videoUrl
          : ApplianceService.DEFAULT_VIDEO,
      likes: likesArray,
      likesCount: likesArray.length,
    };
  }

  private publishedFeedQuery() {
    return this.applianceRepository
      .createQueryBuilder('appliance')
      .leftJoinAndSelect('appliance.likes', 'likes')
      .where('appliance.publicationStatus = :status', { status: 'published' });
  }

  /** Одна следующая опубликованная запись после id (или первая — при обходе круга). */
  private async findNextPublished(afterId: number): Promise<Appliance | null> {
    const next = await this.publishedFeedQuery()
      .andWhere('appliance.applianceId > :id', { id: afterId })
      .orderBy('appliance.applianceId', 'ASC')
      .getOne();

    if (next) {
      return next;
    }

    return this.publishedFeedQuery()
      .orderBy('appliance.applianceId', 'ASC')
      .getOne();
  }

  async getCatalog(search?: string, minPower?: number) {
    const queryBuilder = this.applianceRepository
      .createQueryBuilder('appliance')
      .leftJoinAndSelect('appliance.likes', 'likes')
      .where('appliance.publicationStatus = :status', { status: 'published' });

    if (search && search.trim() !== '') {
      queryBuilder.andWhere('appliance.applianceName ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (minPower !== undefined && !isNaN(minPower) && minPower > 0) {
      queryBuilder.andWhere('appliance.powerWatts >= :minPower', { minPower });
    }

    const list = await queryBuilder.getMany();

    return {
      appliances: list.map((a) => this.formatAppliance(a)),
      totalCount: list.length,
    };
  }

  async getFeedAppliance(id: number, next?: boolean) {
    let appliance: Appliance | null;

    if (next) {
      appliance = await this.findNextPublished(id);
    } else {
      appliance = await this.publishedFeedQuery()
        .andWhere('appliance.applianceId = :id', { id })
        .getOne();
    }

    if (!appliance) {
      throw new NotFoundException('Услуга удалена или не существует');
    }

    const nextAppliance = await this.findNextPublished(appliance.applianceId);
    const hasNext =
      !!nextAppliance && nextAppliance.applianceId !== appliance.applianceId;

    return {
      appliance: this.formatAppliance(appliance),
      nextId: nextAppliance?.applianceId ?? appliance.applianceId,
      hasNext,
    };
  }

  async getDraftForUser(userId: number = 1) {
    const draft = await this.applianceRepository.findOne({
      where: { creatorId: userId, publicationStatus: 'draft' },
      relations: { likes: true },
    });

    return draft ? this.formatAppliance(draft) : null;
  }

  async createOrUpdateDraft(applianceName: string, userId: number = 1) {
    let draft = await this.applianceRepository.findOne({
      where: { creatorId: userId, publicationStatus: 'draft' },
    });

    if (!draft) {
      // Фото/видео в этой ЛР в БД не сохраняем — при отображении подставятся дефолты SSR
      draft = this.applianceRepository.create({
        applianceName: applianceName || 'Новое устройство',
        applianceDescription: '',
        publicationStatus: 'draft',
        powerWatts: 0,
        minTemperature: 10,
        creatorId: userId,
      });
    } else if (applianceName) {
      draft.applianceName = applianceName;
    }

    return await this.applianceRepository.save(draft);
  }

  async publishDraft(
    description: string,
    powerWatts: number,
    minTemperature: number,
    userId: number = 1,
  ) {
    const draft = await this.applianceRepository.findOne({
      where: { creatorId: userId, publicationStatus: 'draft' },
    });

    if (!draft) {
      throw new NotFoundException('Черновик для публикации не найден');
    }

    draft.applianceDescription =
      description || draft.applianceDescription;
    draft.powerWatts = powerWatts || draft.powerWatts;
    draft.minTemperature = minTemperature || draft.minTemperature;
    draft.publicationStatus = 'published';
    draft.formattedAt = new Date();

    return await this.applianceRepository.save(draft);
  }

  async deleteApplianceRaw(id: number): Promise<void> {
    await this.applianceRepository.query(
      `UPDATE appliances SET publication_status = 'deleted' WHERE appliance_id = $1`,
      [id],
    );
  }
}
