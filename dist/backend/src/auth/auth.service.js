"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const role_entity_1 = require("./role.entity");
const session_entity_1 = require("./session.entity");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const audit_log_service_1 = require("./audit-log.service");
let AuthService = class AuthService {
    constructor(userRepo, roleRepo, sessionRepo, jwtService, auditLog) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.sessionRepo = sessionRepo;
        this.jwtService = jwtService;
        this.auditLog = auditLog;
    }
    async signup(dto) {
        const existing = await this.userRepo.findOne({ where: [{ email: dto.email }, { phone: dto.phone }] });
        if (existing)
            throw new common_1.BadRequestException('User already exists');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const role = await this.roleRepo.findOne({ where: { name: dto.role || 'member' } });
        const user = this.userRepo.create({ ...dto, password: passwordHash, role: role ?? undefined });
        await this.userRepo.save(user);
        await this.auditLog.log('signup', user.id);
        return { message: 'Signup successful' };
    }
    async login(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email }, relations: ['role'] });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            await this.auditLog.log('login_failed', user?.id);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.auditLog.log('login', user.id);
        const tokens = this.generateTokens(user);
        await this.sessionRepo.save({ user, refreshToken: tokens.refreshToken });
        return tokens;
    }
    async otpLogin(dto) {
        // Simulate OTP validation (replace with real SMS provider)
        if (dto.otp !== '123456')
            throw new common_1.UnauthorizedException('Invalid OTP');
        const user = await this.userRepo.findOne({ where: { phone: dto.phone }, relations: ['role'] });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        await this.auditLog.log('otp_login', user.id);
        const tokens = this.generateTokens(user);
        await this.sessionRepo.save({ user, refreshToken: tokens.refreshToken });
        return tokens;
    }
    async refreshToken(dto) {
        const session = await this.sessionRepo.findOne({ where: { refreshToken: dto.refreshToken }, relations: ['user'] });
        if (!session)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const tokens = this.generateTokens(session.user);
        session.refreshToken = tokens.refreshToken;
        await this.sessionRepo.save(session);
        return tokens;
    }
    async getProfile(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['role'] });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return user;
    }
    generateTokens(user) {
        const payload = { sub: user.id, role: user.role.name };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        audit_log_service_1.AuditLogService])
], AuthService);
