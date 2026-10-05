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
exports.Like = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const appliance_entity_1 = require("./appliance.entity");
let Like = class Like {
    likeId;
    userId;
    applianceId;
    user;
    appliance;
};
exports.Like = Like;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'like_id' }),
    __metadata("design:type", Number)
], Like.prototype, "likeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Like.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appliance_id' }),
    __metadata("design:type", Number)
], Like.prototype, "applianceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.likes, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Like.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appliance_entity_1.Appliance, (appliance) => appliance.likes, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'appliance_id' }),
    __metadata("design:type", appliance_entity_1.Appliance)
], Like.prototype, "appliance", void 0);
exports.Like = Like = __decorate([
    (0, typeorm_1.Entity)('likes'),
    (0, typeorm_1.Unique)(['userId', 'applianceId'])
], Like);
//# sourceMappingURL=like.entity.js.map