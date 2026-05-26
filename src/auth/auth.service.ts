import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { appConfiguration, TAppConfig } from '../config/app-configuration';
import { jwtConfiguration, TJwtConfig } from '../config/jwt.config';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { JwtPayload, REFRESH_JWT_TYPE, RefreshAuthUser } from './auth.types';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: TAppConfig,
    @Inject(jwtConfiguration.KEY)
    private readonly jwtConfig: TJwtConfig,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

  async register(
    dto: RegisterDto,
    avatarFile?: Express.Multer.File,
  ): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const avatarUrl = avatarFile
      ? this.filesService.getPublicUrl(avatarFile.filename)
      : dto.avatar;
    const user = await this.usersService.create(
      { ...dto, avatar: avatarUrl },
      passwordHash,
    );

    const fullUser = await this.usersRepository.findOne({
      where: { id: user.id },
    });
    const tokens = await this.issueTokenPair(fullUser!);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Хеширует пароль перед сохранением в БД.
   *
   * @param plainPassword - Пароль, введенный пользователем.
   * @returns Хеш пароля.
   */
  async hashPassword(plainPassword: string): Promise<string> {
    const rounds = this.appConfig.hashSalt;
    return bcrypt.hash(plainPassword, rounds);
  }

  /**
   * Хеширует сырое значение refresh токена перед записью в поле `users.refresh_token`.
   * Клиенту всегда отдается нехешированный refresh токен; в БД хранится только хеш.
   *
   * @param rawToken - Подписанный refresh JWT в виде строки.
   * @returns Хеш bcrypt.
   */
  async hashRefreshToken(rawToken: string): Promise<string> {
    const rounds = this.appConfig.hashSalt;
    return bcrypt.hash(rawToken, rounds);
  }

  /**
   * Выпускает пару access и refresh токенов и обновляет хеш refresh в БД для пользователя.
   * Используется после успешного логина или регистрации или при ротации refresh JWT.
   *
   * @param user - Сущность пользователя (нужны `id`, `email`, `role`).
   * @returns Объект с полями `accessToken` и `refreshToken` (сырые токены для ответа клиенту / куки).
   */
  async issueTokenPair(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);
    await this.persistRefreshTokenHash(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  /**
   * Проверяет email + пароль и выпускает пару токенов при успешной аутентификации.
   *
   * @param dto — `{ email, password }` из тела запроса.
   * @returns Пара `accessToken` и `refreshToken`.
   * @throws {@link UnauthorizedException} при неверных учётных данных.
   */
  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    const isPasswordValid =
      user !== null && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokenPair(user);
  }

  /**
   * Инвалидирует refresh токен пользователя, записывая `null` в `users.refresh_token`.
   *
   * @param userId — идентификатор аутентифицированного пользователя.
   */
  async logout(userId: number): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: null });
  }

  /**
   * Выпускает новую пару токенов после успешной проверки refresh (например `POST /auth/refresh` + `RefreshTokenGuard`).
   *
   * @param user — данные из `req.user` после гарды refresh токена (`id`, `email`, `role`).
   * @returns Новая пара `accessToken` и `refreshToken`.
   * @throws {@link UnauthorizedException} если пользователь с `user.id` не найден в БД.
   */
  async refreshSession(user: RefreshAuthUser): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const full = await this.usersRepository.findOne({ where: { id: user.id } });
    if (!full) {
      throw new UnauthorizedException();
    }
    return this.issueTokenPair(full);
  }

  /**
   * Подписывает access токен.
   *
   * @param user — пользователь для полей `id`, `email`, `role`.
   * @returns Подписанная строка access токена.
   */
  private async signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessSecret,
      expiresIn: this.jwtConfig.accessExpiresIn,
    });
  }

  /**
   * Подписывает refresh токен.
   *
   * @param user - Пользователь для полей 'id', 'email', 'role'.
   * @returns Подписанная строка refresh токена.
   */
  private async signRefreshToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: REFRESH_JWT_TYPE,
      },
      {
        secret: this.jwtConfig.refreshSecret,
        expiresIn: this.jwtConfig.refreshExpiresIn,
      },
    );
  }

  /**
   * Сохраняет в БД bcrypt хеш сырого refresh токена для указанного пользователя.
   *
   * @param userId — идентификатор пользователя (`users.id`).
   * @param rawRefreshToken — нехешированный refresh токен (тот, что уходит на клиент).
   */
  private async persistRefreshTokenHash(
    userId: number,
    rawRefreshToken: string,
  ): Promise<void> {
    const hash = await this.hashRefreshToken(rawRefreshToken);
    await this.usersRepository.update(userId, { refreshToken: hash });
  }
}
