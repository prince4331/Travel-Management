import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth/google')
export class GoogleController {
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google login
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any) {
    // Successful authentication, return user info or JWT
    return {
      message: 'Google login successful',
      user: req.user,
      // You can issue JWT here if needed
    };
  }
}
