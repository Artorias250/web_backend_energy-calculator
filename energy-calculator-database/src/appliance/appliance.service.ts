import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Appliance } from '../entities/appliance.entity';

@Injectable()
export class ApplianceService {
  constructor(
    @InjectRepository(Appliance)
    private readonly applianceRepository: Repository<Appliance>,
  ) {}

  private formatAppliance(appliance: Appliance) {
    // Прямые URL из бакета MinIO для медиафайлов по умолчанию
    const defaultImage = 'http://localhost:9000/appliances/kettle.png';
    const defaultVideo = 'http://localhost:9000/appliances/kettle.mp4';

    const likesArray = appliance.likes || [];

    return {
      ...appliance,
      deviceName: appliance.title,
      imageUrl:
        appliance.imageUrl && appliance.imageUrl.trim() !== ''
          ? appliance.imageUrl
          : defaultImage,
      videoUrl:
        appliance.videoUrl && appliance.videoUrl.trim() !== ''
          ? appliance.videoUrl
          : defaultVideo,
      likes: likesArray,
      likesCount: likesArray.length,
    };
  }

  // Метод 1 (GET): Получение и поиск опубликованных услуг (ORM)
  async getCatalog(search?: string, minPower?: number) {
    const queryBuilder = this.applianceRepository
      .createQueryBuilder('appliance')
      .leftJoinAndSelect('appliance.likes', 'likes')
      .where('appliance.status = :status', { status: 'published' });

    if (search && search.trim() !== '') {
      queryBuilder.andWhere('appliance.title ILIKE :search', {
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

  // Метод 2 (GET): Просмотр карточки в ленте. Если deleted — запрет просмотра
  async getFeedAppliance(id: number, next?: boolean) {
    // 1. Получаем текущую карточку обязательно со связью likes
    const appliance = await this.applianceRepository.findOne({
      where: { id },
      relations: { likes: true },
    });

    if (!appliance || appliance.status === 'deleted') {
      throw new NotFoundException('Услуга удалена или не существует');
    }

    // 2. Получаем весь список опубликованных устройств (со связью likes)
    const publishedList = await this.applianceRepository.find({
      where: { status: 'published' },
      relations: { likes: true },
      order: { id: 'ASC' },
    });

    let currentIndex = publishedList.findIndex((a) => a.id === id);
    if (currentIndex === -1) currentIndex = 0;

    if (next) {
      currentIndex = (currentIndex + 1) % publishedList.length;
    }

    const currentAppliance = publishedList[currentIndex];
    const nextAppliance =
      publishedList[(currentIndex + 1) % publishedList.length];

    return {
      appliance: this.formatAppliance(currentAppliance),
      nextId: nextAppliance.id,
      hasNext: publishedList.length > 1,
    };
  }

  // Метод 3 (GET): Открытие страницы создания/черновика для пользователя (creatorId = 1)
  async getDraftForUser(userId: number = 1) {
    const draft = await this.applianceRepository.findOne({
      where: { creatorId: userId, status: 'draft' },
      relations: { likes: true },
    });

    return draft ? this.formatAppliance(draft) : null;
  }

  // Метод 4 (POST): Создание/обновление базовых полей черновика (кнопка Далее) (ORM)
  async createOrUpdateDraft(title: string, userId: number = 1) {
    let draft = await this.applianceRepository.findOne({
      where: { creatorId: userId, status: 'draft' },
    });

    if (!draft) {
      draft = this.applianceRepository.create({
        title: title || 'Новое устройство',
        description: '',
        status: 'draft',
        powerWatts: 0,
        minTemperature: 10,
        // Присваиваем дефолтные медиафайлы из MinIO
        imageUrl: 'http://localhost:9000/appliances/kettle.png',
        videoUrl: 'http://localhost:9000/appliances/kettle.mp4',
        creatorId: userId,
      });
    } else {
      if (title) draft.title = title;
    }

    return await this.applianceRepository.save(draft);
  }

  // Метод 5 (POST): Публикация карточки (ORM)
  async publishDraft(
    description: string,
    powerWatts: number,
    minTemperature: number,
    userId: number = 1,
  ) {
    const draft = await this.applianceRepository.findOne({
      where: { creatorId: userId, status: 'draft' },
    });

    if (!draft) {
      throw new NotFoundException('Черновик для публикации не найден');
    }

    draft.description = description || draft.description;
    draft.powerWatts = powerWatts || draft.powerWatts;
    draft.minTemperature = minTemperature || draft.minTemperature;
    draft.status = 'published';
    draft.formattedAt = new Date();

    return await this.applianceRepository.save(draft);
  }

  // Метод 6 (POST): Логическое удаление через СЫРОЙ SQL запрос (UPDATE ... status = 'deleted')
  async deleteApplianceRaw(id: number): Promise<void> {
    await this.applianceRepository.query(
      `UPDATE appliances SET status = 'deleted' WHERE id = $1`,
      [id],
    );
  }
}
