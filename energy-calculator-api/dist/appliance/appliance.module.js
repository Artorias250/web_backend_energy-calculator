"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplianceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const minio_module_1 = require("../minio/minio.module");
const appliance_entity_1 = require("../entities/appliance.entity");
const like_entity_1 = require("../entities/like.entity");
const user_entity_1 = require("../entities/user.entity");
const appliance_api_controller_1 = require("./appliance-api.controller");
const appliance_api_service_1 = require("./appliance-api.service");
const appliance_controller_1 = require("./appliance.controller");
const appliance_repository_1 = require("./appliance.repository");
const appliance_service_1 = require("./appliance.service");
let ApplianceModule = class ApplianceModule {
};
exports.ApplianceModule = ApplianceModule;
exports.ApplianceModule = ApplianceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([appliance_entity_1.Appliance, like_entity_1.Like, user_entity_1.User]),
            minio_module_1.MinioModule,
        ],
        controllers: [appliance_controller_1.ApplianceController, appliance_api_controller_1.ApplianceApiController],
        providers: [appliance_service_1.ApplianceService, appliance_api_service_1.ApplianceApiService, appliance_repository_1.ApplianceRepository],
        exports: [appliance_service_1.ApplianceService],
    })
], ApplianceModule);
//# sourceMappingURL=appliance.module.js.map