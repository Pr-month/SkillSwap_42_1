import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService, PublicUser } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RegisterDto } from './dto/register.dto';
import { appConfiguration } from '../config/app-configuration';
import { jwtConfiguration } from '../config/jwt.config';

const mockAppConfig = { port: 3000, hashSalt: 4 };
const mockJwtConfig = {
  accessSecret: 'test-access-secret-min-32-characters-long!!!!',
  refreshSecret: 'test-refresh-secret-min-32-characters-long!!!',
  accessExpiresIn: '1h' as const,
  refreshExpiresIn: '7d' as const,
  refreshTokenCookieName: 'refreshToken',
  accessTokenCookieName: 'accessToken',
};

function buildUser(overrides: Partial<User> = {}): User {
  const defaults: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashed',
    about: null,
    birthDate: null,
    gender: null,
    avatar: null,
    cityId: null,
    role: UserRole.USER,
    refreshToken: null,
    registrationDate: new Date('2026-01-01'),
    skills: [],
    wantToLearn: [],
    favoriteSkills: [],
  };
  return { ...defaults, ...overrides };
}

function buildPublicUser(overrides: Partial<User> = {}): PublicUser {
  const { passwordHash: _, refreshToken: __, ...rest } = buildUser(overrides);
  return rest;
}

function createUsersServiceMock() {
  return {
    findByEmail: jest.fn<Promise<User | null>, [string]>(),
    create: jest.fn<Promise<PublicUser>, [CreateUserDto, string]>(),
  };
}

function createJwtServiceMock() {
  return {
    signAsync: jest.fn<
      Promise<string>,
      [Record<string, unknown>, Record<string, unknown>?]
    >(),
  };
}

function createRepositoryMock() {
  return {
    findOne: jest.fn<Promise<User | null>, [{ where: { id: number } }]>(),
    update: jest
      .fn<Promise<void>, [number, Partial<User>]>()
      .mockResolvedValue(undefined),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: ReturnType<typeof createUsersServiceMock>;
  let jwtServiceMock: ReturnType<typeof createJwtServiceMock>;
  let repoMock: ReturnType<typeof createRepositoryMock>;

  beforeEach(async () => {
    usersServiceMock = createUsersServiceMock();
    jwtServiceMock = createJwtServiceMock();
    repoMock = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: appConfiguration.KEY, useValue: mockAppConfig },
        { provide: jwtConfiguration.KEY, useValue: mockJwtConfig },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: getRepositoryToken(User), useValue: repoMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------

  describe('register', () => {
    const dto: RegisterDto = {
      name: 'John',
      email: 'john@example.com',
      password: 'secret123',
    };

    it('должен создать пользователя и вернуть user + токены', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      usersServiceMock.create.mockResolvedValue(
        buildPublicUser({ id: 1, name: dto.name, email: dto.email }),
      );
      repoMock.findOne.mockResolvedValue(
        buildUser({ id: 1, email: dto.email, role: UserRole.USER }),
      );
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access-tok')
        .mockResolvedValueOnce('refresh-tok');

      const result = await service.register(dto);

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);

      expect(usersServiceMock.create).toHaveBeenCalledTimes(1);
      const [argsDto, argsPasswordHash] = usersServiceMock.create.mock.calls[0];
      expect(argsDto).toBe(dto);
      expect(argsPasswordHash).not.toBe(dto.password);
      expect(typeof argsPasswordHash).toBe('string');
      expect(argsPasswordHash.length).toBeGreaterThan(0);

      expect(result).toMatchObject({
        user: { id: 1, name: dto.name, email: dto.email },
        accessToken: 'access-tok',
        refreshToken: 'refresh-tok',
      });
    });

    it('должен выбросить ConflictException при дублирующем email', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(
        buildUser({ id: 5, email: dto.email }),
      );

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(usersServiceMock.create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------

  describe('hashPassword', () => {
    it('должен вернуть bcrypt-хеш, отличный от исходного пароля', async () => {
      const hash = await service.hashPassword('mypassword');
      expect(hash).not.toBe('mypassword');
      expect(await bcrypt.compare('mypassword', hash)).toBe(true);
    });

    it('должен давать разные хеши для разных паролей', async () => {
      const hash1 = await service.hashPassword('password-a');
      const hash2 = await service.hashPassword('password-b');
      expect(hash1).not.toBe(hash2);
    });
  });

  // ---------------------------------------------------------------

  describe('hashRefreshToken', () => {
    it('должен вернуть bcrypt-хеш токена', async () => {
      const hash = await service.hashRefreshToken('some-raw-token');
      expect(hash).not.toBe('some-raw-token');
      expect(await bcrypt.compare('some-raw-token', hash)).toBe(true);
    });
  });

  // ---------------------------------------------------------------

  describe('issueTokenPair', () => {
    it('должен подписать оба токена и сохранить хеш refresh в БД', async () => {
      const user = buildUser({ id: 1, email: 't@t.com', role: UserRole.USER });

      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.issueTokenPair(user);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);

      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: 1, email: 't@t.com', role: UserRole.USER },
        { secret: mockJwtConfig.accessSecret, expiresIn: '1h' },
      );

      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: 1, email: 't@t.com', role: UserRole.USER, type: 'refresh' },
        { secret: mockJwtConfig.refreshSecret, expiresIn: '7d' },
      );

      const updateCall = repoMock.update.mock.calls[0];
      expect(updateCall[0]).toBe(1);
      expect(updateCall[1].refreshToken).toEqual(expect.any(String));
    });
  });

  // ---------------------------------------------------------------

  describe('refreshSession', () => {
    it('должен вернуть новую пару токенов для существующего пользователя', async () => {
      repoMock.findOne.mockResolvedValue(
        buildUser({ id: 1, email: 't@t.com', role: UserRole.USER }),
      );
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');

      const result = await service.refreshSession({
        id: 1,
        email: 't@t.com',
        role: UserRole.USER,
      });

      expect(repoMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    });

    it('должен выбросить UnauthorizedException если пользователь не найден', async () => {
      repoMock.findOne.mockResolvedValue(null);

      await expect(
        service.refreshSession({
          id: 999,
          email: 'x@x.com',
          role: UserRole.USER,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
