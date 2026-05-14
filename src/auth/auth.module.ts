import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConfiguration, TJwtConfig } from '../config/jwt.config';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { ensureValue } from '../utils/ensure';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [jwtConfiguration.KEY],
      useFactory: (jwtCfg: TJwtConfig) => ({
        secret: jwtCfg.accessSecret,
        signOptions: {
          expiresIn: jwtCfg.accessExpiresIn,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
  exports: [AuthService, JwtModule, AccessTokenGuard, RefreshTokenGuard],
})
export class AuthModule {}
