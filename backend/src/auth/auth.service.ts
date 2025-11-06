import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from './role.entity';
import { Session } from './session.entity';
import { SignupDto, LoginDto, OtpLoginDto, RefreshTokenDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    private jwtService: JwtService,
    private auditLog: AuditLogService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const role = await this.resolveRole(dto.role);

    const user = this.userRepo.create({
      email: dto.email,
      phone: dto.phone,
      password: passwordHash,
      role,
    });

    await this.userRepo.save(user);
    await this.auditLog.log('signup', user.id);

    return { message: 'Signup successful' };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email }, relations: ['role'] });
    console.log('Login user found:', user);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      await this.auditLog.log('login_failed', user?.id);
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.auditLog.log('login', user.id);
    const tokens = this.generateTokens(user);
    console.log('Generated tokens with payload sub:', user.id);
    await this.sessionRepo.save({ user, refreshToken: tokens.refreshToken });
    return tokens;
  }

  async otpLogin(dto: OtpLoginDto) {
    // Simulate OTP validation (replace with real SMS provider)
    if (dto.otp !== '123456') throw new UnauthorizedException('Invalid OTP');
    const user = await this.userRepo.findOne({ where: { phone: dto.phone }, relations: ['role'] });
    if (!user) throw new UnauthorizedException('User not found');
    await this.auditLog.log('otp_login', user.id);
    const tokens = this.generateTokens(user);
    await this.sessionRepo.save({ user, refreshToken: tokens.refreshToken });
    return tokens;
  }

  async refreshToken(dto: RefreshTokenDto) {
    const session = await this.sessionRepo.findOne({
      where: { refreshToken: dto.refreshToken },
      relations: ['user', 'user.role'],
    });
    if (!session) throw new UnauthorizedException('Invalid refresh token');
    const tokens = this.generateTokens(session.user);
    session.refreshToken = tokens.refreshToken;
    await this.sessionRepo.save(session);
    return tokens;
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['role'] });
    if (!user) throw new UnauthorizedException('User not found');
    const { password, ...safeUser } = user;
    return safeUser;
  }

  generateTokens(user: User) {
    const payload = { sub: user.id, role: user.role?.name ?? 'member' };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  private async resolveRole(roleName?: string): Promise<Role> {
    const allowedRoles = new Set(['admin', 'co-admin', 'member', 'guest', 'super_admin']);
    const normalized = (roleName ?? 'member').toLowerCase();
    const target = allowedRoles.has(normalized) ? normalized : 'member';
    let role = await this.roleRepo.findOne({ where: { name: target } });
    if (!role) {
      role = this.roleRepo.create({ name: target });
      await this.roleRepo.save(role);
    }
    return role;
  }
}
