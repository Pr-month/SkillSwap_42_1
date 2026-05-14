import { Type } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

export { appConfiguration, TAppConfig } from './app-configuration';
export { jwtConfiguration, type TJwtConfig } from './jwt.config';

export function getAppImports(): Type<unknown>[] {
  return [UsersModule, AuthModule];
}
