import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RegisterDto } from './dto/register.dto';
import { RefreshAuthUser, RegisterResult, TokenPair } from './auth.types';
import { Request } from 'express';

function createAuthServiceMock() {
  return {
    register: jest.fn<Promise<RegisterResult>, [RegisterDto]>(),
    refreshSession: jest.fn<Promise<TokenPair>, [RefreshAuthUser]>(),
  };
}

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: ReturnType<typeof createAuthServiceMock>;

  beforeEach(async () => {
    authServiceMock = createAuthServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------

  describe('POST /auth/register', () => {
    it('должен делегировать в authService.register', async () => {
      const dto: RegisterDto = {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'pass123456',
      };

      const expected = {
        user: { id: 1, name: 'Alice', email: 'alice@example.com' },
        accessToken: 'a-token',
        refreshToken: 'r-token',
      } as RegisterResult;
      authServiceMock.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(authServiceMock.register).toHaveBeenCalledWith(dto);
      expect(authServiceMock.register).toHaveBeenCalledTimes(1);
      expect(result).toBe(expected);
    });
  });

  // ---------------------------------------------------------------

  describe('POST /auth/refresh', () => {
    it('должен делегировать в authService.refreshSession с req.user', async () => {
      const mockUser: RefreshAuthUser = {
        id: 1,
        email: 'test@example.com',
        role: 1,
      };
      const mockReq = {
        user: mockUser,
      } as Request & { user: RefreshAuthUser };

      const expected: TokenPair = {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      };
      authServiceMock.refreshSession.mockResolvedValue(expected);

      const result = await controller.refresh(mockReq);

      expect(authServiceMock.refreshSession).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(expected);
    });
  });
});
