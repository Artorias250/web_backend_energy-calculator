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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplianceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appliance_entity_1 = require("../entities/appliance.entity");
const current_user_singleton_1 = require("../common/current-user.singleton");
const media_url_1 = require("../common/media-url");
let ApplianceService = class ApplianceService {
    applianceRepository;
    constructor(applianceRepository) {
        this.applianceRepository = applianceRepository;
    }
    formatAppliance(appliance) {
        const likesArray = appliance.likes || [];
        return {
            ...appliance,
            id: appliance.applianceId,
            deviceName: appliance.applianceName,
            description: appliance.applianceDescription,
            imageUrl: (0, media_url_1.resolveMediaUrl)(appliance.imageUrl, 'image'),
            videoUrl: (0, media_url_1.resolveMediaUrl)(appliance.videoUrl, 'video'),
            likes: likesArray,
            likesCount: likesArray.length,
        };
    }
    publishedFeedQuery() {
        return this.applianceRepository
            .createQueryBuilder('appliance')
            .leftJoinAndSelect('appliance.likes', 'likes')
            .where('appliance.publicationStatus = :status', { status: 'published' });
    }
    async findNextPublished(afterId) {
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
    async getCatalog(search, minPower) {
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
    async getFeedAppliance(id, next) {
        let appliance;
        if (next) {
            appliance = await this.findNextPublished(id);
        }
        else {
            appliance = await this.publishedFeedQuery()
                .andWhere('appliance.applianceId = :id', { id })
                .getOne();
        }
        if (!appliance) {
            throw new common_1.NotFoundException('Услуга удалена или не существует');
        }
        const nextAppliance = await this.findNextPublished(appliance.applianceId);
        const hasNext = !!nextAppliance && nextAppliance.applianceId !== appliance.applianceId;
        return {
            appliance: this.formatAppliance(appliance),
            nextId: nextAppliance?.applianceId ?? appliance.applianceId,
            hasNext,
        };
    }
    async getDraftForUser() {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        const draft = await this.applianceRepository.findOne({
            where: { creatorId: userId, publicationStatus: 'draft' },
            relations: { likes: true },
        });
        return draft ? this.formatAppliance(draft) : null;
    }
    async createOrUpdateDraft(applianceName) {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        let draft = await this.applianceRepository.findOne({
            where: { creatorId: userId, publicationStatus: 'draft' },
        });
        if (!draft) {
            draft = this.applianceRepository.create({
                applianceName: applianceName || 'Новое устройство',
                applianceDescription: '',
                publicationStatus: 'draft',
                powerWatts: 0,
                minTemperature: 10,
                creatorId: userId,
                createdAt: new Date(),
            });
        }
        else if (applianceName) {
            draft.applianceName = applianceName;
        }
        return await this.applianceRepository.save(draft);
    }
    async publishDraft(description, powerWatts, minTemperature) {
        const userId = (0, current_user_singleton_1.getCurrentUserId)();
        const draft = await this.applianceRepository.findOne({
            where: { creatorId: userId, publicationStatus: 'draft' },
        });
        if (!draft) {
            throw new common_1.NotFoundException('Черновик для публикации не найден');
        }
        draft.applianceDescription =
            description || draft.applianceDescription;
        draft.powerWatts = powerWatts || draft.powerWatts;
        draft.minTemperature = minTemperature || draft.minTemperature;
        draft.publicationStatus = 'published';
        draft.formattedAt = new Date();
        return await this.applianceRepository.save(draft);
    }
    async deleteApplianceRaw(id) {
        await this.applianceRepository.query(`UPDATE appliances SET publication_status = 'deleted' WHERE appliance_id = $1`, [id]);
    }
};
exports.ApplianceService = ApplianceService;
exports.ApplianceService = ApplianceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appliance_entity_1.Appliance)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ApplianceService);
//# sourceMappingURL=appliance.service.js.map