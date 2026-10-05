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
exports.Appliance = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const like_entity_1 = require("./like.entity");
let Appliance = class Appliance {
    applianceId;
    applianceName;
    applianceDescription;
    publicationStatus;
    imageUrl;
    videoUrl;
    powerWatts;
    minTemperature;
    createdAt;
    formattedAt;
    completedAt;
    creatorId;
    moderatorId;
    creator;
    moderator;
    likes;
};
exports.Appliance = Appliance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'appliance_id' }),
    __metadata("design:type", Number)
], Appliance.prototype, "applianceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, name: 'appliance_name' }),
    __metadata("design:type", String)
], Appliance.prototype, "applianceName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        name: 'appliance_description',
    }),
    __metadata("design:type", Object)
], Appliance.prototype, "applianceDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 32,
        default: 'draft',
        name: 'publication_status',
    }),
    __metadata("design:type", String)
], Appliance.prototype, "publicationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true, name: 'image_url' }),
    __metadata("design:type", Object)
], Appliance.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true, name: 'video_url' }),
    __metadata("design:type", Object)
], Appliance.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'power_watts' }),
    __metadata("design:type", Object)
], Appliance.prototype, "powerWatts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'min_temperature' }),
    __metadata("design:type", Object)
], Appliance.prototype, "minTemperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'created_at' }),
    __metadata("design:type", Object)
], Appliance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'formatted_at' }),
    __metadata("design:type", Object)
], Appliance.prototype, "formattedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'completed_at' }),
    __metadata("design:type", Object)
], Appliance.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'creator_id' }),
    __metadata("design:type", Number)
], Appliance.prototype, "creatorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'moderator_id', nullable: true }),
    __metadata("design:type", Object)
], Appliance.prototype, "moderatorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.appliances, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'creator_id' }),
    __metadata("design:type", user_entity_1.User)
], Appliance.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'RESTRICT', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'moderator_id' }),
    __metadata("design:type", Object)
], Appliance.prototype, "moderator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => like_entity_1.Like, (like) => like.appliance),
    __metadata("design:type", Array)
], Appliance.prototype, "likes", void 0);
exports.Appliance = Appliance = __decorate([
    (0, typeorm_1.Entity)('appliances'),
    (0, typeorm_1.Index)('uq_one_draft_per_creator', ['creatorId'], {
        unique: true,
        where: "publication_status = 'draft'",
    })
], Appliance);
//# sourceMappingURL=appliance.entity.js.map