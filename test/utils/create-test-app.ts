import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/common/all-exceptions.filter';

export async function createTestApp(): Promise<NestExpressApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const rawApp = moduleFixture.createNestApplication();
  const app = rawApp as NestExpressApplication;
  app.use(cookieParser());
  app.useStaticAssets(path.join(process.cwd(), 'public'), {
    prefix: '/public/',
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  app.setGlobalPrefix('api');
  await app.init();
  return app;
}

export async function closeTestApp(app: NestExpressApplication): Promise<void> {
  const dataSource = app.get(DataSource);
  await app.close();
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
}
