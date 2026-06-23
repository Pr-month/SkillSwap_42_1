import { join } from 'path';

export function assetPath(): string {
  return join(process.cwd(), process.env.STATIC_ASSETS_PATH ?? 'public');
}
