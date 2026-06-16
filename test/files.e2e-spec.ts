import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { HTTP_STATUS_CODE } from '../src/common/constants/http-status-code.constant';
import { UPLOAD_DIR } from '../src/files/files.service';
import { authHeader, registerUser } from './utils/auth.helper';
import { closeTestApp, createTestApp } from './utils/create-test-app';
import {
  API_PREFIX,
  FIXTURE_INVALID_TXT,
  FIXTURE_VALID_JPEG,
  FIXTURE_VALID_PNG,
  FIXTURE_VALID_WEBP,
} from './utils/test-data';

interface UploadResponse {
  url: string;
}

interface ErrorResponse {
  message: string;
}

async function cleanupUploadedFile(url: string): Promise<void> {
  const filename = url.split('/').pop();
  if (filename) {
    await fs
      .unlink(path.join(process.cwd(), UPLOAD_DIR, filename))
      .catch(() => {});
  }
}

describe('Files (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const user = await registerUser(app.getHttpServer());
    accessToken = user.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/upload', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/upload`)
        .expect(HTTP_STATUS_CODE.UNAUTHORIZED);
    });

    it.each([
      ['PNG', FIXTURE_VALID_PNG, '.png'],
      ['JPEG', FIXTURE_VALID_JPEG, '.jpeg'],
      ['WebP', FIXTURE_VALID_WEBP, '.webp'],
    ])(
      'should upload valid %s image and return public URL',
      async (_label, fixturePath, extension) => {
        const res = await request(app.getHttpServer())
          .post(`${API_PREFIX}/upload`)
          .set(authHeader(accessToken))
          .attach('file', fixturePath)
          .expect(HTTP_STATUS_CODE.CREATED);

        const body = res.body as UploadResponse;
        expect(body.url).toMatch(
          new RegExp(`^\\/public\\/uploads\\/[\\w-]+\\${extension}$`),
        );

        await request(app.getHttpServer())
          .get(body.url)
          .expect(HTTP_STATUS_CODE.OK);

        await cleanupUploadedFile(body.url);
      },
    );

    it('should reject non-image files', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/upload`)
        .set(authHeader(accessToken))
        .attach('file', FIXTURE_INVALID_TXT)
        .expect(HTTP_STATUS_CODE.BAD_REQUEST);

      const body = res.body as ErrorResponse;
      expect(body.message).toMatch(/file/i);
    });

    it('should reject file exceeding 2 MB', async () => {
      const bigBuffer = Buffer.alloc(3 * 1024 * 1024, 'a');

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/upload`)
        .set(authHeader(accessToken))
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
      await fs.mkdir(path.join(process.cwd(), UPLOAD_DIR), { recursive: true });
      const testContent = 'static-serve-test';
      const testFilename = 'static-test.txt';
      const testFilePath = path.join(process.cwd(), UPLOAD_DIR, testFilename);
      await fs.writeFile(testFilePath, testContent);

      const res = await request(app.getHttpServer())
        .get(`/public/uploads/${testFilename}`)
        .expect(HTTP_STATUS_CODE.OK);

      expect(res.text).toBe(testContent);
      await fs.unlink(testFilePath).catch(() => {});
    });
  });
});
