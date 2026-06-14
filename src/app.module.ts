import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  appConfiguration,
  getAppImports,
  jwtConfiguration,
} from './config/app.config';
import { databaseConfig, TDatabaseConfig } from './config/database.config';
import { envFilePath } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePath(),
      load: [appConfiguration, databaseConfig, jwtConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: TDatabaseConfig) => ({
        ...config,
        autoLoadEntities: true,
      }),
    }),
    ...getAppImports(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
