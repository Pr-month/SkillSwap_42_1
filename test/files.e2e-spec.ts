import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/all-exceptions.filter';
import { UPLOAD_DIR } from '../src/files/files.service';
import { HTTP_STATUS_CODE } from '../src/common/constants/http-status-code.constant';

interface UploadResponse {
  url: string;
}

interface ErrorResponse {
  message: string;
}

describe('Files (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;

  const testUser = {
    name: 'File Test User',
    email: `filetest-${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const rawApp = moduleFixture.createNestApplication();
    app = rawApp as NestExpressApplication;
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
    await app.init();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('POST /upload', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(HTTP_STATUS_CODE.OK);

      // Token is returned in response body, not in cookies
      accessToken = (loginRes.body as { accessToken: string }).accessToken;
      expect(accessToken).toBeTruthy();
    });

    it('should require authentication', async () => {
      const buffer = Buffer.from('fake image data');
      await request(app.getHttpServer())
        .post('/upload')
        .attach('file', buffer, 'test.png')
        .expect(HTTP_STATUS_CODE.UNAUTHORIZED);
    });

    it('should upload a valid image and return public URL', async () => {
      // 1x1 white PNG
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'base64',
      );

      const res = await request(app.getHttpServer())
        .post('/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', pngBuffer, 'test.png')
        .expect(HTTP_STATUS_CODE.CREATED);

      const body = res.body as UploadResponse;
      expect(body.url).toMatch(/^\/public\/uploads\/[\w-]+\.png$/);

      // GET uploaded file via static serving
      const getRes = await request(app.getHttpServer())
        .get(body.url)
        .expect(HTTP_STATUS_CODE.OK);

      const getBody = getRes.body as Buffer;
      expect(getBody).toBeInstanceOf(Buffer);
      expect(getBody.length).toBeGreaterThan(0);

      // Cleanup uploaded file
      const filename = body.url.split('/').pop();
      if (filename) {
        await fs
          .unlink(path.join(process.cwd(), UPLOAD_DIR, filename))
          .catch(() => {});
      }
    });

    it('should reject non-image files', async () => {
      const buffer = Buffer.from('not an image');

      const res = await request(app.getHttpServer())
        .post('/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', buffer, 'test.txt')
        .expect(HTTP_STATUS_CODE.BAD_REQUEST);

      const body = res.body as ErrorResponse;
      expect(body.message).toContain('image');
    });

    it('should reject file exceeding 2 MB', async () => {
      // 3 MB buffer
      const bigBuffer = Buffer.alloc(3 * 1024 * 1024, 'a');

      await request(app.getHttpServer())
        .post('/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', bigBuffer, 'big.png')
        .expect(HTTP_STATUS_CODE.PAYLOAD_TOO_LARGE);
    });
  });

  describe('GET /public/uploads/:filename (static serving)', () => {
    it('should return 404 for non-existent file', async () => {
      await request(app.getHttpServer())
        .get('/public/uploads/nonexistent-file.jpg')
        .expect(HTTP_STATUS_CODE.NOT_FOUND);
    });

    it('should serve an existing file', async () => {
      // Write a test file directly to public/uploads
      await fs.mkdir(path.join(process.cwd(), UPLOAD_DIR), {
        recursive: true,
      });
      const testContent = 'static-serve-test';
      const testFilename = 'static-test.txt';
      const testFilePath = path.join(process.cwd(), UPLOAD_DIR, testFilename);
      await fs.writeFile(testFilePath, testContent);

      const res = await request(app.getHttpServer())
        .get(`/public/uploads/${testFilename}`)
        .expect(HTTP_STATUS_CODE.OK);

      expect(res.text).toBe(testContent);

      // Cleanup
      await fs.unlink(testFilePath).catch(() => {});
    });
  });
});
