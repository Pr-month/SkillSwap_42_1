import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { ensureValue } from '../utils/ensure';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      // TODO: заменить на inject: [jwtConfig.KEY] после завершения #8
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: ensureValue(
          configService.get('JWT_ACCESS_SECRET'),
          'dev-access-secret',
          'Missing required environment variable: JWT_ACCESS_SECRET',
        ),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_ACCESS_EXPIRY', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
