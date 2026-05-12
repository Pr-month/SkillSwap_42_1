import { ConfigType, registerAs } from '@nestjs/config';

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

export const appConfiguration = registerAs('APP_CONFIG', () => ({
  port: parseEnvInt(process.env.PORT, 3000),
  hashSalt: parseEnvInt(process.env.HASH_SALT, 10),
}));

export type TAppConfig = ConfigType<typeof appConfiguration>;
