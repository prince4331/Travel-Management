import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string = '';

  @IsPhoneNumber()
  phone: string = '';

  @MinLength(6)
  password: string = '';

  @IsOptional()
  @IsString()
  role?: string;
}

export class LoginDto {
  @IsEmail()
  email: string = '';

  @MinLength(6)
  password: string = '';
}

export class OtpLoginDto {
  @IsPhoneNumber()
  phone: string = '';

  @IsString()
  otp: string = '';
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string = '';
}
