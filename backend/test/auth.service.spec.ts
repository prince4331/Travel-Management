import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/users/user.entity';
import { Role } from '../src/auth/role.entity';
import { Session } from '../src/auth/session.entity';
import { SignupDto, LoginDto } from '../src/auth/auth.dto';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    // Mock repositories and services
    service = new AuthService(
      { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } as any,
      { findOne: jest.fn() } as any,
      { save: jest.fn() } as any,
      { sign: jest.fn(() => 'token') } as any,
      { log: jest.fn() } as any,
    );
  });

  it('should sign up a new user', async () => {
    (service as any).userRepo.findOne.mockResolvedValue(null);
    (service as any).roleRepo.findOne.mockResolvedValue({ name: 'member' });
    (service as any).userRepo.create.mockReturnValue({ id: 1 });
    (service as any).userRepo.save.mockResolvedValue({ id: 1 });
    const dto: SignupDto = { email: 'test@test.com', phone: '1234567890', password: 'password' };
    const result = await service.signup(dto);
    expect(result.message).toBe('Signup successful');
  });

  it('should fail login with wrong credentials', async () => {
    (service as any).userRepo.findOne.mockResolvedValue(null);
    await expect(service.login({ email: 'x', password: 'y' })).rejects.toThrow();
  });
});
