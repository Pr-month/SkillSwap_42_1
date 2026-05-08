import { Type } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

/**
 * Парсит переменные окружения из .env файла в числовой формат.
 * 
 * @param value - Переменная окружения.
 * @param fallback - Значение по умолчанию.
 * @returns Числовое значение переменной окружения или значение по умолчанию.
 */
function parseEnvInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface AppConfig {
  port: number;
  hashSalt: number;
}

export const appConfiguration = registerAs(
  'app',
  (): AppConfig => ({
    port: parseEnvInt(process.env.PORT, 3000),
    hashSalt: parseEnvInt(process.env.HASH_SALT, 10),
  }),
);

export function getAppImports(): Type<unknown>[] {
  return [UsersModule, AuthModule];
}
