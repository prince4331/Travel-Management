import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

// Require at runtime to avoid missing type declaration issues
const GoogleOAuth = require('passport-google-oauth20');

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleOAuth.Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    } as any);
  }

  async validate(accessToken: any, refreshToken: any, profile: any, done: any): Promise<any> {
    // Extract user info from Google profile
    const { id, emails, displayName, photos } = profile as any;
    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      name: displayName,
      photo: photos?.[0]?.value,
      provider: 'google',
    };
    done(null, user);
  }
}
