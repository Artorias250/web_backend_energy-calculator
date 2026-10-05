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
exports.ApplianceRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appliance_entity_1 = require("../entities/appliance.entity");
const like_entity_1 = require("../entities/like.entity");
let ApplianceRepository = class ApplianceRepository {
    appliances;
    likes;
    constructor(appliances, likes) {
        this.appliances = appliances;
        this.likes = likes;
    }
    publishedQuery() {
        return this.appliances
            .createQueryBuilder('appliance')
            .leftJoinAndSelect('appliance.likes', 'likes')
            .where('appliance.publicationStatus = :status', { status: 'published' });
    }
    findPublished(minPower) {
        const query = this.publishedQuery().orderBy('appliance.applianceId', 'ASC');
        if (minPower !== undefined && !Number.isNaN(minPower) && minPower > 0) {
            query.andWhere('appliance.powerWatts >= :minPower', { minPower });
        }
        return query.getMany();
    }
    findPublishedById(id) {
        return this.publishedQuery()
            .andWhere('appliance.applianceId = :id', { id })
            .getOne();
    }
    async findNextPublished(afterId) {
        const next = await this.publishedQuery()
            .andWhere('appliance.applianceId > :id', { id: afterId })
            .orderBy('appliance.applianceId', 'ASC')
            .getOne();
        if (next) {
            return next;
        }
        return this.publishedQuery()
            .orderBy('appliance.applianceId', 'ASC')
            .getOne();
    }
    findFirstPublished() {
        return this.publishedQuery()
            .orderBy('appliance.applianceId', 'ASC')
            .getOne();
    }
    findDraft(userId) {
        return this.appliances.findOne({
            where: { creatorId: userId, publicationStatus: 'draft' },
            relations: { likes: true },
        });
    }
    findById(id) {
        return this.appliances.findOne({
            where: { applianceId: id },
            relations: { likes: true },
        });
    }
    create(data) {
        return this.appliances.create(data);
    }
    save(appliance) {
        return this.appliances.save(appliance);
    }
    findLike(userId, applianceId) {
        return this.likes.findOne({ where: { userId, applianceId } });
    }
    saveLike(userId, applianceId) {
        return this.likes.save(this.likes.create({ userId, applianceId }));
    }
    async removeLike(like) {
        await this.likes.remove(like);
    }
};
exports.ApplianceRepository = ApplianceRepository;
exports.ApplianceRepository = ApplianceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appliance_entity_1.Appliance)),
    __param(1, (0, typeorm_1.InjectRepository)(like_entity_1.Like)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ApplianceRepository);
//# sourceMappingURL=appliance.repository.js.map