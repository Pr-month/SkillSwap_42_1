import { ConfigType, registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

function createDatabaseOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER || 'devuser',
    password: process.env.POSTGRES_PASSWORD || 'devpass',
    database: process.env.POSTGRES_DB || 'skillswap',
    synchronize: process.env.NODE_ENV !== 'production',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  };
}

export const databaseConfig = registerAs(
  'postgres-db',
  (): DataSourceOptions => createDatabaseOptions(),
);

config();

export const AppDataSource = new DataSource(databaseConfig());

export type TDatabaseConfig = ConfigType<typeof databaseConfig>;
