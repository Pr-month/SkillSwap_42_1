import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { HTTP_STATUS_CODE } from '../src/common/constants/http-status-code.constant';
import { authHeader, registerUser } from './utils/auth.helper';
import { closeTestApp, createTestApp } from './utils/create-test-app';
import { API_PREFIX } from './utils/test-data';

interface PublicUser {
  id: number;
  name: string;
  about?: string | null;
  passwordHash?: string;
}

describe('Users (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;
  let userId: number;
  let userEmail: string;
  const password = 'password123';

  beforeAll(async () => {
    app = await createTestApp();
    const registered = await registerUser(app.getHttpServer(), { password });
    accessToken = registered.accessToken;
    userId = registered.user.id;
    userEmail = registered.user.email;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/users', () => {
    it('should return public user list without sensitive fields', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users`)
        .expect(HTTP_STATUS_CODE.OK);

      const body = res.body as PublicUser[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0].passwordHash).toBeUndefined();
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('name');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const listRes = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users`)
        .expect(HTTP_STATUS_CODE.OK);

      const seededUser = (listRes.body as PublicUser[])[0];

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/users/${seededUser.id}`)
        .expect(HTTP_STATUS_CODE.OK);
    });

    it('should return empty body for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users/999999`)
        .expect(HTTP_STATUS_CODE.OK);

      expect(res.body).toEqual({});
    });
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', async () => {
      await request(app.getHttpServer())
        .get(`${API_PREFIX}/users/me`)
        .set(authHeader(accessToken))
        .expect(HTTP_STATUS_CODE.OK);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get(`${API_PREFIX}/users/me`)
        .expect(HTTP_STATUS_CODE.UNAUTHORIZED);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update current user profile', async () => {
      const about = `E2E about ${Date.now()}`;

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/me`)
        .set(authHeader(accessToken))
        .send({ about })
        .expect(HTTP_STATUS_CODE.OK);
    });
  });

  describe('PATCH /api/users/me/password', () => {
    it('should change password with correct old password', async () => {
      const newPassword = 'newpassword456';

      const res = await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/me/password`)
        .set(authHeader(accessToken))
        .send({ oldPassword: password, newPassword })
        .expect(HTTP_STATUS_CODE.OK);

      expect(res.body).toEqual({
        message: 'Password updated successfully',
      });

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/login`)
        .send({ email: userEmail, password: newPassword })
        .expect(HTTP_STATUS_CODE.OK);
    });

    it('should return 401 for incorrect old password', async () => {
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/me/password`)
        .set(authHeader(accessToken))
        .send({ oldPassword: 'wrongoldpass', newPassword: 'anotherpass1' })
        .expect(HTTP_STATUS_CODE.UNAUTHORIZED);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user by id', async () => {
      const name = `E2E Updated Name ${Date.now()}`;

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/${userId}`)
        .send({ name })
        .expect(HTTP_STATUS_CODE.OK);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user by id', async () => {
      const toDelete = await registerUser(app.getHttpServer());

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/users/${toDelete.user.id}`)
        .expect(HTTP_STATUS_CODE.OK);

      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users/${toDelete.user.id}`)
        .expect(HTTP_STATUS_CODE.OK);

      expect(res.body).toEqual({});
    });

    it('should return 404 when deleting non-existent user', async () => {
      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/users/999999`)
        .expect(HTTP_STATUS_CODE.NOT_FOUND);
    });
  });
});
