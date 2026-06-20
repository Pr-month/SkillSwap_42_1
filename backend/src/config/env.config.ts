import { config, DotenvConfigOutput } from 'dotenv';

export function envFilePath(): string {
  return process.env.ENV_FILE ?? '.env';
}

export function loadEnv(): DotenvConfigOutput {
  return config({ path: envFilePath() });
}
