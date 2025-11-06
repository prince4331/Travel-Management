import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { SignupDto, LoginDto } from '../src/auth/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(() => {
    service = {
      signup: jest.fn().mockResolvedValue({ message: 'Signup successful' }),
      login: jest.fn().mockResolvedValue({ accessToken: 'token', refreshToken: 'token' }),
      otpLogin: jest.fn(),
      refreshToken: jest.fn(),
      getProfile: jest.fn(),
    } as any;
    controller = new AuthController(service);
  });

  it('should sign up', async () => {
    const dto: SignupDto = { email: 'test@test.com', phone: '1234567890', password: 'password' };
    const result = await controller.signup(dto);
    expect(result.message).toBe('Signup successful');
  });

  it('should login', async () => {
    const dto: LoginDto = { email: 'test@test.com', password: 'password' };
    const result = await controller.login(dto);
    expect(result.accessToken).toBe('token');
  });
});
