import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { HTTP_STATUS_CODE } from '../src/common/constants/http-status-code.constant';
import { closeTestApp, createTestApp } from './utils/create-test-app';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(HTTP_STATUS_CODE.OK)
      .expect('Hello World!');
  });
});
