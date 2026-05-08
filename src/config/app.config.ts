import { Type } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

export function getAppImports(): Type<unknown>[] {
  return [UsersModule, AuthModule];
}
