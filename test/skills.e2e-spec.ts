import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { HTTP_STATUS_CODE } from '../src/common/constants/http-status-code.constant';
import { authHeader, registerUser } from './utils/auth.helper';
import { closeTestApp, createTestApp } from './utils/create-test-app';
import { API_PREFIX } from './utils/test-data';

interface CategoryTree {
  id: number;
  name: string;
  children: CategoryTree[];
}

interface Skill {
  id: number;
  title: string;
  description: string;
  images: string[];
  owner?: { id: number };
}

interface PaginatedSkills {
  data: Skill[];
  page: number;
  totalPages: number;
}

describe('Skills (e2e)', () => {
  let app: NestExpressApplication;
  let ownerToken: string;
  let otherUserToken: string;
  let categoryId: number;

  beforeAll(async () => {
    app = await createTestApp();

    const owner = await registerUser(app.getHttpServer());
    ownerToken = owner.accessToken;

    const other = await registerUser(app.getHttpServer());
    otherUserToken = other.accessToken;

    const categoriesRes = await request(app.getHttpServer())
      .get(`${API_PREFIX}/categories`)
      .expect(HTTP_STATUS_CODE.OK);

    const categories = categoriesRes.body as CategoryTree[];
    categoryId = categories[0].children[0]?.id ?? categories[0].id;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/skills', () => {
    it('should create skill for authenticated user', async () => {
      const title = `E2E Skill ${Date.now()}`;

      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills`)
        .set(authHeader(ownerToken))
        .send({
          title,
          description: 'E2E skill description',
          categoryId,
        })
        .expect(HTTP_STATUS_CODE.CREATED);

      const body = res.body as Skill;
      expect(body.title).toBe(title);
      expect(body.description).toBe('E2E skill description');
      expect(body.id).toBeTruthy();
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills`)
        .send({
          title: 'No auth skill',
          description: 'desc',
          categoryId,
        })
        .expect(HTTP_STATUS_CODE.UNAUTHORIZED);
    });

    it('should return 400 for empty title', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills`)
        .set(authHeader(ownerToken))
        .send({
          title: '',
          description: 'desc',
          categoryId,
        })
        .expect(HTTP_STATUS_CODE.BAD_REQUEST);
    });
  });

  describe('GET /api/skills', () => {
    it('should return paginated skills list', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/skills?page=1&limit=5`)
        .expect(HTTP_STATUS_CODE.OK);

      const body = res.body as PaginatedSkills;
      expect(body.page).toBe(1);
      expect(body.totalPages).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/skills/:id', () => {
    let skillId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills`)
        .set(authHeader(ownerToken))
        .send({
          title: `E2E Get Skill ${Date.now()}`,
          description: 'Get by id test',
          categoryId,
        })
        .expect(HTTP_STATUS_CODE.CREATED);

      skillId = (res.body as Skill).id;
    });

    it('should return skill by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/skills/${skillId}`)
        .expect(HTTP_STATUS_CODE.OK);

      expect((res.body as Skill).id).toBe(skillId);
    });

    it('should return 404 for non-existent skill', async () => {
      await request(app.getHttpServer())
        .get(`${API_PREFIX}/skills/999999`)
        .expect(HTTP_STATUS_CODE.NOT_FOUND);
    });
  });

  describe('PATCH /api/skills/:id', () => {
    let skillId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills`)
        .set(authHeader(ownerToken))
        .send({
          title: `E2E Patch Skill ${Date.now()}`,
          description: 'Patch test',
          categoryId,
        })
        .expect(HTTP_STATUS_CODE.CREATED);

      skillId = (res.body as Skill).id;
    });

    it('should update skill as owner', async () => {
      const newTitle = `E2E Patched ${Date.now()}`;

      const res = await request(app.getHttpServer())
        .patch(`${API_PREFIX}/skills/${skillId}`)
        .set(authHeader(ownerToken))
        .send({ title: newTitle })
        .expect(HTTP_STATUS_CODE.OK);

      expect((res.body as Skill).title).toBe(newTitle);
    });

    it('should return 403 for non-owner', async () => {
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/skills/${skillId}`)
        .set(authHeader(otherUserToken))
        .send({ title: 'Hacked title' })
        .expect(HTTP_STATUS_CODE.FORBIDDEN);
    });
  });

  describe('DELETE /api/skills/:id', () => {
    it('should delete skill as owner', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills`)
        .set(authHeader(ownerToken))
        .send({
          title: `E2E Delete Skill ${Date.now()}`,
          description: 'Delete test',
          categoryId,
        })
        .expect(HTTP_STATUS_CODE.CREATED);

      const skillId = (createRes.body as Skill).id;

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/skills/${skillId}`)
        .set(authHeader(ownerToken))
        .expect(HTTP_STATUS_CODE.OK);

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/skills/${skillId}`)
        .expect(HTTP_STATUS_CODE.NOT_FOUND);
    });
  });

  describe('Favorites /api/skills/:id/favorite', () => {
    let skillId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills`)
        .set(authHeader(ownerToken))
        .send({
          title: `E2E Favorite Skill ${Date.now()}`,
          description: 'Favorite test',
          categoryId,
        })
        .expect(HTTP_STATUS_CODE.CREATED);

      skillId = (res.body as Skill).id;
    });

    it('should add skill to favorites', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills/${skillId}/favorite`)
        .set(authHeader(otherUserToken))
        .expect(HTTP_STATUS_CODE.CREATED);

      expect(res.body).toEqual({ success: true });
    });

    it('should remove skill from favorites', async () => {
      const res = await request(app.getHttpServer())
        .delete(`${API_PREFIX}/skills/${skillId}/favorite`)
        .set(authHeader(otherUserToken))
        .expect(HTTP_STATUS_CODE.OK);

      expect(res.body).toEqual({ success: true });
    });
  });
});
