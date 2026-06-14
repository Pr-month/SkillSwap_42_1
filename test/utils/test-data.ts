import * as path from 'path';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@skillswap.ru';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';
export const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'user123';

export const SEEDED_USER_ANNA = 'anna.smirnova@email.ru';
export const SEEDED_USER_ELENA = 'elena.nov@email.ru';

export const FIXTURES_DIR = path.join(__dirname, '../fixtures');
export const FIXTURE_IMAGES_DIR = path.join(FIXTURES_DIR, 'images');
export const FIXTURE_FILES_DIR = path.join(FIXTURES_DIR, 'files');

export const FIXTURE_VALID_PNG = path.join(FIXTURE_IMAGES_DIR, 'valid-1x1.png');
export const FIXTURE_VALID_JPEG = path.join(
  FIXTURE_IMAGES_DIR,
  'valid-1x1.jpeg',
);
export const FIXTURE_VALID_WEBP = path.join(
  FIXTURE_IMAGES_DIR,
  'valid-1x1.webp',
);
export const FIXTURE_INVALID_TXT = path.join(FIXTURE_FILES_DIR, 'invalid.txt');

export const API_PREFIX = '/api';

export function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export function defaultRegisterPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'E2E Test User',
    email: uniqueEmail(),
    password: 'password123',
    ...overrides,
  };
}
