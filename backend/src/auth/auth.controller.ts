import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, OtpLoginDto, RefreshTokenDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Email/password signup
   */
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  /**
   * Email/password login
   */
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Phone OTP login
   */
  @Post('otp')
  async otpLogin(@Body() dto: OtpLoginDto) {
    return this.authService.otpLogin(dto);
  }

  /**
   * Refresh JWT token
   */
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  /**
   * Get current user profile (JWT required)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.userId;
    if (userId === undefined || userId === null) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return this.authService.getProfile(userId);
  }

  /**
   * Example: Only Admin can access
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminOnly(@Req() req: any) {
    return { message: 'Admin access granted' };
  }
}
