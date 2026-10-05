import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getCurrentUserId } from '../common/current-user.singleton';
import {
  extensionForMime,
  isStoredObjectKey,
  latinObjectName,
} from '../common/media-url';
import { MinioService } from '../minio/minio.service';
import { ApplianceRepository } from './appliance.repository';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { PublishApplianceDto } from './dto/publish-appliance.dto';
import {
  ApplianceResponse,
  ApplianceSerializer,
} from './serializers/appliance.serializer';

@Injectable()
export class ApplianceApiService {
  constructor(
    private readonly appliances: ApplianceRepository,
    private readonly minioService: MinioService,
  ) {}

  async getList(minPower?: number): Promise<ApplianceResponse[]> {
    const userId = getCurrentUserId();
    const rows = await this.appliances.findPublished(minPower);
    return rows.map((row) => ApplianceSerializer.toResponse(row, userId));
  }

  async getFeed(id?: number, next = false): Promise<ApplianceResponse> {
    const userId = getCurrentUserId();
    const appliance =
      id === undefined
        ? await this.appliances.findFirstPublished()
        : next
          ? await this.appliances.findNextPublished(id)
          : await this.appliances.findPublishedById(id);

    if (!appliance) {
      throw new NotFoundException('Услуга удалена или не существует');
    }

    return ApplianceSerializer.toResponse(appliance, userId);
  }

  async getDraft(): Promise<ApplianceResponse> {
    const userId = getCurrentUserId();
    const draft = await this.appliances.findDraft(userId);
    if (!draft) {
      throw new NotFoundException('Черновик не найден');
    }
    return ApplianceSerializer.toResponse(draft, userId);
  }

  async createWithFiles(
    dto: CreateApplianceDto,
    image: Express.Multer.File,
    video: Express.Multer.File,
  ): Promise<{ created: boolean; appliance: ApplianceResponse }> {
    const userId = getCurrentUserId();
    this.assertMedia(image, 'image');
    this.assertMedia(video, 'video');

    const imageFileName = latinObjectName('image', image.mimetype);
    const videoFileName = latinObjectName('video', video.mimetype);

    try {
      await this.minioService.upload(imageFileName, image.buffer, image.mimetype);
      await this.minioService.upload(videoFileName, video.buffer, video.mimetype);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Не удалось сохранить файлы в MinIO: ${message}`,
      );
    }

    let draft = await this.appliances.findDraft(userId);
    const created = !draft;
    const previousImage = draft?.imageUrl ?? null;
    const previousVideo = draft?.videoUrl ?? null;

    if (!draft) {
      draft = this.appliances.create({
        applianceName: dto.applianceName,
        applianceDescription: dto.description,
        publicationStatus: 'draft',
        imageUrl: imageFileName,
        videoUrl: videoFileName,
        powerWatts: dto.powerWatts,
        minTemperature: dto.minTemperature,
        creatorId: userId,
        moderatorId: null,
        createdAt: new Date(),
        formattedAt: null,
        completedAt: null,
      });
    } else {
      draft.applianceName = dto.applianceName;
      draft.applianceDescription = dto.description;
      draft.powerWatts = dto.powerWatts;
      draft.minTemperature = dto.minTemperature;
      draft.imageUrl = imageFileName;
      draft.videoUrl = videoFileName;
    }

    const saved = await this.appliances.save(draft);
    await this.removeReplacedObject(previousImage);
    await this.removeReplacedObject(previousVideo);

    const withLikes = await this.appliances.findDraft(userId);
    return {
      created,
      appliance: ApplianceSerializer.toResponse(withLikes ?? saved, userId),
    };
  }

  async publish(dto: PublishApplianceDto): Promise<ApplianceResponse> {
    const userId = getCurrentUserId();
    const draft = await this.appliances.findDraft(userId);
    if (!draft) {
      throw new NotFoundException('Черновик для публикации не найден');
    }

    draft.applianceDescription = dto.description;
    draft.powerWatts = dto.powerWatts;
    draft.minTemperature = dto.minTemperature;
    draft.publicationStatus = 'published';
    draft.formattedAt = new Date();

    const saved = await this.appliances.save(draft);
    const published = await this.appliances.findPublishedById(saved.applianceId);
    return ApplianceSerializer.toResponse(published ?? saved, userId);
  }

  async softDelete(id: number): Promise<{ message: string; id: number }> {
    const userId = getCurrentUserId();
    const appliance = await this.appliances.findById(id);
    if (!appliance || appliance.publicationStatus === 'deleted') {
      throw new NotFoundException('Услуга удалена или не существует');
    }
    if (appliance.creatorId !== userId) {
      throw new ForbiddenException('Можно удалить только свою услугу');
    }

    appliance.publicationStatus = 'deleted';
    appliance.completedAt = new Date();
    await this.appliances.save(appliance);

    return { message: 'Услуга удалена', id };
  }

  async setLike(
    id: number,
    value: 0 | 1,
  ): Promise<{ applianceId: number; value: 0 | 1; likesCount: number; isLiked: 0 | 1 }> {
    const userId = getCurrentUserId();
    const appliance = await this.appliances.findPublishedById(id);
    if (!appliance) {
      throw new NotFoundException('Услуга удалена или не существует');
    }

    const existing = await this.appliances.findLike(userId, id);
    if (value === 1 && !existing) {
      await this.appliances.saveLike(userId, id);
    }
    if (value === 0 && existing) {
      await this.appliances.removeLike(existing);
    }

    const updated = await this.appliances.findPublishedById(id);
    const likesCount = updated?.likes?.length ?? 0;
    return {
      applianceId: id,
      value,
      likesCount,
      isLiked: value,
    };
  }

  private assertMedia(file: Express.Multer.File, kind: 'image' | 'video'): void {
    if (!file) {
      throw new BadRequestException(`Нужен файл ${kind}`);
    }
    if (!extensionForMime(file.mimetype)) {
      throw new BadRequestException(
        kind === 'image'
          ? 'Изображение должно быть jpg, png, webp или gif'
          : 'Видео должно быть mp4, webm или mov',
      );
    }
  }

  private async removeReplacedObject(stored: string | null): Promise<void> {
    if (!isStoredObjectKey(stored)) {
      return;
    }
    try {
      await this.minioService.remove(stored);
    } catch {
      return;
    }
  }
}
