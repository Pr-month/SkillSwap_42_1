import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getAppImports } from './config/app.config';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ReturnType<typeof databaseConfig>) => ({
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
