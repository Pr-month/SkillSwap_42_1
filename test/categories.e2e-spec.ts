import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { HTTP_STATUS_CODE } from '../src/common/constants/http-status-code.constant';
import {
  authHeader,
  loginAsAdmin,
  registerUser,
} from './utils/auth.helper';
import { closeTestApp, createTestApp } from './utils/create-test-app';
import { API_PREFIX } from './utils/test-data';

interface CategoryTree {
  id: number;
  name: string;
  children: CategoryTree[];
}

interface Category {
  id: number;
  name: string;
  parent?: { id: number; name: string } | null;
}

describe('Categories (e2e)', () => {
  let app: NestExpressApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const admin = await loginAsAdmin(app.getHttpServer());
    adminToken = admin.accessToken;
    const user = await registerUser(app.getHttpServer());
    userToken = user.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/categories', () => {
    it('should return nested category tree from seed data', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/categories`)
        .expect(HTTP_STATUS_CODE.OK);

      const body = res.body as CategoryTree[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('name');
      expect(body[0]).toHaveProperty('children');
      expect(Array.isArray(body[0].children)).toBe(true);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return category by id', async () => {
      const listRes = await request(app.getHttpServer())
        .get(`${API_PREFIX}/categories`)
        .expect(HTTP_STATUS_CODE.OK);

      const categories = listRes.body as CategoryTree[];
      const categoryId = categories[0].id;

      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/categories/${categoryId}`)
        .expect(HTTP_STATUS_CODE.OK);

      const body = res.body as Category;
      expect(body.id).toBe(categoryId);
      expect(body.name).toBeTruthy();
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .get(`${API_PREFIX}/categories/999999`)
        .expect(HTTP_STATUS_CODE.NOT_FOUND);
    });
  });

  describe('POST /api/categories', () => {
    it('should create category as admin', async () => {
      const name = `E2E Cat ${Date.now()}`;

      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/categories`)
        .set(authHeader(adminToken))
        .send({ name })
        .expect(HTTP_STATUS_CODE.CREATED);

      const body = res.body as Category;
      expect(body.name).toBe(name);
      expect(body.parent).toBeNull();
    });

    it('should create child category with parentId', async () => {
      const parentName = `E2E Parent ${Date.now()}`;
      const parentRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/categories`)
        .set(authHeader(adminToken))
        .send({ name: parentName })
        .expect(HTTP_STATUS_CODE.CREATED);

      const parent = parentRes.body as Category;
      const childName = `E2E Child ${Date.now()}`;

      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/categories`)
        .set(authHeader(adminToken))
        .send({ name: childName, parentId: parent.id })
        .expect(HTTP_STATUS_CODE.CREATED);

      const body = res.body as Category;
      expect(body.name).toBe(childName);
      expect(body.parent?.id).toBe(parent.id);
    });

    it('should return 403 for regular user', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/categories`)
        .set(authHeader(userToken))
        .send({ name: `E2E Forbidden ${Date.now()}` })
        .expect(HTTP_STATUS_CODE.FORBIDDEN);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/categories`)
        .send({ name: `E2E NoAuth ${Date.now()}` })
        .expect(HTTP_STATUS_CODE.UNAUTHORIZED);
    });
  });

  describe('PATCH /api/categories/:id', () => {
    it('should update category as admin', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/categories`)
        .set(authHeader(adminToken))
        .send({ name: `E2E Update ${Date.now()}` })
        .expect(HTTP_STATUS_CODE.CREATED);

      const category = createRes.body as Category;
      const updatedName = `E2E Updated ${Date.now()}`;

      const res = await request(app.getHttpServer())
        .patch(`${API_PREFIX}/categories/${category.id}`)
        .set(authHeader(adminToken))
        .send({ name: updatedName })
        .expect(HTTP_STATUS_CODE.OK);

      expect((res.body as Category).name).toBe(updatedName);
    });

    it('should return 400 for cyclic parent assignment', async () => {
      const parentRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/categories`)
        .set(authHeader(adminToken))
        .send({ name: `E2E Cycle Parent ${Date.now()}` })
        .expect(HTTP_STATUS_CODE.CREATED);

      const childRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/categories`)
        .set(authHeader(adminToken))
        .send({
          name: `E2E Cycle Child ${Date.now()}`,
          parentId: (parentRes.body as Category).id,
        })
        .expect(HTTP_STATUS_CODE.CREATED);

      const parent = parentRes.body as Category;
      const child = childRes.body as Category;

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/categories/${parent.id}`)
        .set(authHeader(adminToken))
        .send({ parentId: child.id })
        .expect(HTTP_STATUS_CODE.BAD_REQUEST);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete category as admin', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/categories`)
        .set(authHeader(adminToken))
        .send({ name: `E2E Delete ${Date.now()}` })
        .expect(HTTP_STATUS_CODE.CREATED);

      const category = createRes.body as Category;

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/categories/${category.id}`)
        .set(authHeader(adminToken))
        .expect(HTTP_STATUS_CODE.OK);

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/categories/${category.id}`)
        .expect(HTTP_STATUS_CODE.NOT_FOUND);
    });
  });
});
