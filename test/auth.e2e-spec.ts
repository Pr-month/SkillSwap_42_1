import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { HTTP_STATUS_CODE } from '../src/common/constants/http-status-code.constant';
import {
  authHeader,
  decodeAccessTokenSub,
  loginUser,
  registerUser,
} from './utils/auth.helper';
import { closeTestApp, createTestApp } from './utils/create-test-app';
import {
  API_PREFIX,
  defaultRegisterPayload,
  FIXTURE_VALID_PNG,
} from './utils/test-data';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse extends AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    passwordHash?: string;
    avatar?: string | null;
  };
}

describe('Auth (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const payload = defaultRegisterPayload();

      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send(payload)
        .expect(HTTP_STATUS_CODE.CREATED);

      const body = res.body as RegisterResponse;
      expect(body.accessToken).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
      expect(decodeAccessTokenSub(body.accessToken)).toBeTruthy();
    });

    it('should return 409 for duplicate email', async () => {
      const payload = defaultRegisterPayload();

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send(payload)
        .expect(HTTP_STATUS_CODE.CREATED);

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send(payload)
        .expect(HTTP_STATUS_CODE.CONFLICT);
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send(defaultRegisterPayload({ email: 'not-an-email' }))
        .expect(HTTP_STATUS_CODE.BAD_REQUEST);
    });

    it('should return 400 for short password', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send(defaultRegisterPayload({ password: '123' }))
        .expect(HTTP_STATUS_CODE.BAD_REQUEST);
    });

    it('should register with avatar file upload', async () => {
      const payload = defaultRegisterPayload();

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .field('name', payload.name as string)
        .field('email', payload.email as string)
        .field('password', payload.password as string)
        .attach('avatar', FIXTURE_VALID_PNG)
        .expect(HTTP_STATUS_CODE.CREATED);
    });
  });

  describe('POST /api/auth/login', () => {
    const loginUserData = defaultRegisterPayload();

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send(loginUserData);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: loginUserData.email,
          password: loginUserData.password,
        })
        .expect(HTTP_STATUS_CODE.OK);

      const body = res.body as AuthResponse;
      expect(body.accessToken).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
    });

    it('should return 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: loginUserData.email,
          password: 'wrongpassword',
        })
        .expect(HTTP_STATUS_CODE.UNAUTHORIZED);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/login`)
        .send({ email: 'bad-email', password: 'password123' })
        .expect(HTTP_STATUS_CODE.BAD_REQUEST);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout with valid access token', async () => {
      const { accessToken } = await registerUser(app.getHttpServer());

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/logout`)
        .set(authHeader(accessToken))
        .expect(HTTP_STATUS_CODE.OK);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/logout`)
        .expect(HTTP_STATUS_CODE.UNAUTHORIZED);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh session with valid refresh token', async () => {
      const { refreshToken } = await registerUser(app.getHttpServer());

      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/refresh`)
        .set(authHeader(refreshToken))
        .expect(HTTP_STATUS_CODE.OK);

      const body = res.body as AuthResponse;
      expect(body.accessToken).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
    });

    it('should return 401 without refresh token', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/refresh`)
        .expect(HTTP_STATUS_CODE.UNAUTHORIZED);
    });
  });
});
