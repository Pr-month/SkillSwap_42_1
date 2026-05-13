import { ConfigType, registerAs } from '@nestjs/config';

/**
 * JWT: секреты подписи и время жизни access/refresh токенов.
 *
 * Переменные окружения:
 * - `JWT_ACCESS_SECRET` — ключ для access-токена
 * - `JWT_ACCESS_EXPIRY` — TTL access-токена (строка для `jsonwebtoken`, например `15m`)
 * - `JWT_REFRESH_SECRET` — ключ для refresh-токена
 * - `JWT_REFRESH_EXPIRY` — TTL refresh-токена (например `7d`)
 */
export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRY ?? '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY ?? '7d',
}));

export type TJwtConfig = ConfigType<typeof jwtConfig>;
