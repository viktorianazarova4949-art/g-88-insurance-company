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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("../../../../Downloads/src/src/users/users.repository");
const role_enum_1 = require("../../../../Downloads/src/src/users/enums/role.enum");
let UsersService = class UsersService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(user) {
        user.role = role_enum_1.Role.CUSTOMER;
        user.active = true;
        return this.repository.save(user);
    }
    async getAllActiveUsers() {
        return this.repository.findAllActive();
    }
    async getActiveUserById(id) {
        const user = await this.repository.findById(id);
        if (!user || !user.active) {
            throw Error();
        }
        return user;
    }
    async update(id, user) {
        const foundUser = await this.repository.findById(id);
        if (foundUser) {
            foundUser.name = user.name;
            await this.repository.save(foundUser);
        }
    }
    async deleteById(id) {
        const user = await this.getActiveUserById(id);
        user.active = false;
        await this.repository.save(user);
    }
    async restoreById(id) {
        const foundUser = await this.repository.findById(id);
        if (foundUser && !foundUser.active) {
            foundUser.active = true;
            await this.repository.save(foundUser);
        }
    }
    async setRole(id, role) {
        const user = await this.getActiveUserById(id);
        user.role = role;
        await this.repository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map