import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { HTTP_STATUS_CODE } from '../src/common/constants/http-status-code.constant';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    const dataSource = app.get(DataSource);
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HTTP_STATUS_CODE.OK)
      .expect('Hello World!');
  });
});
