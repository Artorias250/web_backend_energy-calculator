"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplianceApiService = void 0;
const common_1 = require("@nestjs/common");
const current_user_singleton_1 = require("../common/current-user.singleton");
const media_url_1 = require("../common/media-url");
const minio_service_1 = require("../minio/minio.service");
const appliance_repository_1 = require("./appliance.repository");
const appliance_serializer_1 = require("./serializers/appliance.serializer");
let ApplianceApiService = class ApplianceApiService {
    appliances;
    minioService;
    constructor(appliances, minioService) {
        this.appliances = appliances;
        this.minioService = minioService;
    }
    async getList(minPower) {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        const rows = await this.appliances.findPublished(minPower);
        return rows.map((row) => appliance_serializer_1.ApplianceSerializer.toResponse(row, userId));
    }
    async getFeed(id, next = false) {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        const appliance = id === undefined
            ? await this.appliances.findFirstPublished()
            : next
                ? await this.appliances.findNextPublished(id)
                : await this.appliances.findPublishedById(id);
        if (!appliance) {
            throw new common_1.NotFoundException('Услуга удалена или не существует');
        }
        return appliance_serializer_1.ApplianceSerializer.toResponse(appliance, userId);
    }
    async getDraft() {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        const draft = await this.appliances.findDraft(userId);
        if (!draft) {
            throw new common_1.NotFoundException('Черновик не найден');
        }
        return appliance_serializer_1.ApplianceSerializer.toResponse(draft, userId);
    }
    async createWithFiles(dto, image, video) {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        this.assertMedia(image, 'image');
        this.assertMedia(video, 'video');
        const imageFileName = (0, media_url_1.latinObjectName)('image', image.mimetype);
        const videoFileName = (0, media_url_1.latinObjectName)('video', video.mimetype);
        try {
            await this.minioService.upload(imageFileName, image.buffer, image.mimetype);
            await this.minioService.upload(videoFileName, video.buffer, video.mimetype);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new common_1.InternalServerErrorException(`Не удалось сохранить файлы в MinIO: ${message}`);
        }
        let draft = await this.appliances.findDraft(userId);
        const created = !draft;
        const previousImage = draft?.imageUrl ?? null;
        const previousVideo = draft?.videoUrl ?? null;
        if (!draft) {
            draft = this.appliances.create({
                applianceName: dto.applianceName,
                applianceDescription: null,
                publicationStatus: 'draft',
                imageUrl: imageFileName,
                videoUrl: videoFileName,
                powerWatts: null,
                minTemperature: null,
                creatorId: userId,
                moderatorId: null,
                createdAt: new Date(),
                formattedAt: null,
                completedAt: null,
            });
        }
        else {
            draft.applianceName = dto.applianceName;
            draft.imageUrl = imageFileName;
            draft.videoUrl = videoFileName;
        }
        const saved = await this.appliances.save(draft);
        await this.removeReplacedObject(previousImage);
        await this.removeReplacedObject(previousVideo);
        return {
            created,
            appliance: appliance_serializer_1.ApplianceSerializer.toCreateResponse(saved),
        };
    }
    async publish(dto) {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        const draft = await this.appliances.findDraft(userId);
        if (!draft) {
            throw new common_1.NotFoundException('Черновик для публикации не найден');
        }
        draft.applianceDescription = dto.description;
        draft.powerWatts = dto.powerWatts;
        draft.minTemperature = dto.minTemperature;
        draft.publicationStatus = 'published';
        draft.formattedAt = new Date();
        const saved = await this.appliances.save(draft);
        const published = await this.appliances.findPublishedById(saved.applianceId);
        return appliance_serializer_1.ApplianceSerializer.toResponse(published ?? saved, userId);
    }
    async softDelete(id) {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        const appliance = await this.appliances.findById(id);
        if (!appliance || appliance.publicationStatus === 'deleted') {
            throw new common_1.NotFoundException('Услуга удалена или не существует');
        }
        if (appliance.creatorId !== userId) {
            throw new common_1.ForbiddenException('Можно удалить только свою услугу');
        }
        appliance.publicationStatus = 'deleted';
        appliance.completedAt = new Date();
        await this.appliances.save(appliance);
        return { message: 'Услуга удалена', id };
    }
    async setLike(id, value) {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        const appliance = await this.appliances.findPublishedById(id);
        if (!appliance) {
            throw new common_1.NotFoundException('Услуга удалена или не существует');
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
    assertMedia(file, kind) {
        if (!file) {
            throw new common_1.BadRequestException(`Нужен файл ${kind}`);
        }
        if (!(0, media_url_1.extensionForMime)(file.mimetype)) {
            throw new common_1.BadRequestException(kind === 'image'
                ? 'Изображение должно быть jpg, png, webp или gif'
                : 'Видео должно быть mp4, webm или mov');
        }
    }
    async removeReplacedObject(stored) {
        if (!(0, media_url_1.isStoredObjectKey)(stored)) {
            return;
        }
        try {
            await this.minioService.remove(stored);
        }
        catch {
            return;
        }
    }
};
exports.ApplianceApiService = ApplianceApiService;
exports.ApplianceApiService = ApplianceApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [appliance_repository_1.ApplianceRepository,
        minio_service_1.MinioService])
], ApplianceApiService);
//# sourceMappingURL=appliance-api.service.js.map