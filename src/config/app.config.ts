import { Type } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';
import { SkillsModule } from '../skills/skills.module';
import { UsersModule } from '../users/users.module';

export { appConfiguration, TAppConfig } from './app-configuration';
export { jwtConfiguration, type TJwtConfig } from './jwt.config';

export function getAppImports(): Type<unknown>[] {
  return [UsersModule, AuthModule, SkillsModule, FilesModule];
}
