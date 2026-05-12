import { ConfigType, registerAs } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';

/**
 * Секреты и TTL для access/refresh JWT (согласно ТЗ: access 1h, refresh 7d).
 */
export const jwtConfiguration = registerAs('JWT_CONFIG', () => {
  const accessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ??
    '1h') as SignOptions['expiresIn'];
  const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ??
    '7d') as SignOptions['expiresIn'];

  return {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ?? 'dev-only-access-secret-min-32-chars!!',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ?? 'dev-only-refresh-secret-min-32-chars!',
    accessExpiresIn,
    refreshExpiresIn,
    refreshTokenCookieName:
      process.env.JWT_REFRESH_COOKIE_NAME ?? 'refreshToken',
    accessTokenCookieName: process.env.JWT_ACCESS_COOKIE_NAME ?? 'accessToken',
  };
});

export type TJwtConfig = ConfigType<typeof jwtConfiguration>;
