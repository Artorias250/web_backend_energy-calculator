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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const appliance_entity_1 = require("./appliance.entity");
const like_entity_1 = require("./like.entity");
let User = class User {
    userId;
    userName;
    email;
    password;
    appliances;
    likes;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'user_id' }),
    __metadata("design:type", Number)
], User.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, name: 'user_name', unique: true }),
    __metadata("design:type", String)
], User.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appliance_entity_1.Appliance, (appliance) => appliance.creator),
    __metadata("design:type", Array)
], User.prototype, "appliances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => like_entity_1.Like, (like) => like.user),
    __metadata("design:type", Array)
], User.prototype, "likes", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map