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
exports.ApplianceController = void 0;
const common_1 = require("@nestjs/common");
const appliance_service_1 = require("./appliance.service");
let ApplianceController = class ApplianceController {
    applianceService;
    constructor(applianceService) {
        this.applianceService = applianceService;
    }
    async getCatalog(search, minPower) {
        const powerNum = minPower !== undefined && minPower !== '' ? Number(minPower) : 0;
        const catalogData = await this.applianceService.getCatalog(search, powerNum);
        return {
            title: 'Каталог приборов',
            isCatalog: true,
            appliances: catalogData.appliances,
            search: search || '',
            minPower: powerNum,
        };
    }
    async getFeed(id, next) {
        const isNext = next === 'true';
        const data = await this.applianceService.getFeedAppliance(id, isNext);
        return {
            title: 'Лента приборов',
            isFeed: true,
            ...data,
        };
    }
    async getDraft() {
        const draft = await this.applianceService.getDraftForUser();
        console.log('--- DRAFT DATA SENT TO TEMPLATE ---', draft);
        return {
            title: 'Черновик прибора',
            isDraft: true,
            appliance: draft,
            hasDraft: !!draft,
        };
    }
    async createDraft(deviceName) {
        await this.applianceService.createOrUpdateDraft(deviceName);
    }
    async publishDraft(description, powerWatts, minTemperature) {
        const published = await this.applianceService.publishDraft(description, parseInt(powerWatts, 10) || 0, parseInt(minTemperature, 10) || 10);
        return {
            url: `/appliances-feed/${published.applianceId}`,
        };
    }
    async deleteAppliance(id) {
        const applianceId = parseInt(id, 10);
        if (!isNaN(applianceId)) {
            await this.applianceService.deleteApplianceRaw(applianceId);
        }
    }
};
exports.ApplianceController = ApplianceController;
__decorate([
    (0, common_1.Get)('appliances-catalog'),
    (0, common_1.Render)('appliances-catalog'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('minPower')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "getCatalog", null);
__decorate([
    (0, common_1.Get)('appliances-feed/:id'),
    (0, common_1.Render)('appliances-feed'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('next')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)('appliances-draft'),
    (0, common_1.Render)('appliances-draft'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "getDraft", null);
__decorate([
    (0, common_1.Post)('appliances-draft/next'),
    (0, common_1.Redirect)('/appliances-draft', 302),
    __param(0, (0, common_1.Body)('deviceName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "createDraft", null);
__decorate([
    (0, common_1.Post)('appliances-draft/publish'),
    (0, common_1.Redirect)('/appliances-catalog', 302),
    __param(0, (0, common_1.Body)('description')),
    __param(1, (0, common_1.Body)('powerWatts')),
    __param(2, (0, common_1.Body)('minTemperature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "publishDraft", null);
__decorate([
    (0, common_1.Post)('appliances/delete'),
    (0, common_1.Redirect)('/appliances-catalog', 302),
    __param(0, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "deleteAppliance", null);
exports.ApplianceController = ApplianceController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [appliance_service_1.ApplianceService])
], ApplianceController);
//# sourceMappingURL=appliance.controller.js.map