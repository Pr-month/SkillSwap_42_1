import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('POSTGRES_HOST', 'localhost'),
  port: configService.get<number>('POSTGRES_PORT', 5432),
  username: configService.get<string>('POSTGRES_USER', 'devuser'),
  password: configService.get<string>('POSTGRES_PASSWORD', 'devpass'),
  database: configService.get<string>('POSTGRES_DB', 'skillswap'),
  autoLoadEntities: true,
  synchronize: true,
});
