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
exports.ApplianceApiController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const appliance_api_service_1 = require("./appliance-api.service");
const appliance_filter_dto_1 = require("./dto/appliance-filter.dto");
const create_appliance_dto_1 = require("./dto/create-appliance.dto");
const like_dto_1 = require("./dto/like.dto");
const publish_appliance_dto_1 = require("./dto/publish-appliance.dto");
let ApplianceApiController = class ApplianceApiController {
    applianceApiService;
    constructor(applianceApiService) {
        this.applianceApiService = applianceApiService;
    }
    getList(filters) {
        return this.applianceApiService.getList(filters.minPower);
    }
    getFeed() {
        return this.applianceApiService.getFeed();
    }
    getFeedById(id, next) {
        return this.applianceApiService.getFeed(id, next === 'true');
    }
    getDraft() {
        return this.applianceApiService.getDraft();
    }
    async create(dto, files, response) {
        const image = files?.image?.[0];
        const video = files?.video?.[0];
        if (!image || !video) {
            throw new common_1.BadRequestException('Нужны файлы image и video');
        }
        const result = await this.applianceApiService.createWithFiles(dto, image, video);
        response.status(result.created ? 201 : 200);
        return result.appliance;
    }
    publish(dto) {
        return this.applianceApiService.publish(dto);
    }
    remove(id) {
        return this.applianceApiService.softDelete(id);
    }
    like(id, dto) {
        return this.applianceApiService.setLike(id, dto.value);
    }
};
exports.ApplianceApiController = ApplianceApiController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [appliance_filter_dto_1.ApplianceFilterDto]),
    __metadata("design:returntype", void 0)
], ApplianceApiController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('feed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplianceApiController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)('feed/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('next')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ApplianceApiController.prototype, "getFeedById", null);
__decorate([
    (0, common_1.Get)('draft'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplianceApiController.prototype, "getDraft", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
    ], {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 50 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_appliance_dto_1.CreateApplianceDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ApplianceApiController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('draft'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [publish_appliance_dto_1.PublishApplianceDto]),
    __metadata("design:returntype", void 0)
], ApplianceApiController.prototype, "publish", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ApplianceApiController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, like_dto_1.LikeDto]),
    __metadata("design:returntype", void 0)
], ApplianceApiController.prototype, "like", null);
exports.ApplianceApiController = ApplianceApiController = __decorate([
    (0, common_1.Controller)('api/appliances'),
    __metadata("design:paramtypes", [appliance_api_service_1.ApplianceApiService])
], ApplianceApiController);
//# sourceMappingURL=appliance-api.controller.js.map