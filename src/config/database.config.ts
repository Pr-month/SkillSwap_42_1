import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const databaseConfig = registerAs(
  'postgres-db',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER || 'devuser',
    password: process.env.POSTGRES_PASSWORD || 'devpass',
    database: process.env.POSTGRES_DB || 'skillswap',
    synchronize: process.env.NODE_ENV !== 'production',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  }),
);
