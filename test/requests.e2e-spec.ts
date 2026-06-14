import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { HTTP_STATUS_CODE } from '../src/common/constants/http-status-code.constant';
import { RequestStatus } from '../src/requests/enums/request-status.enum';
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
}

interface RequestEntity {
  id: number;
  status: RequestStatus;
  sender: { id: number };
  receiver: { id: number };
  offeredSkill: { id: number };
  requestedSkill: { id: number };
}

describe('Requests (e2e)', () => {
  let app: NestExpressApplication;
  let senderToken: string;
  let receiverToken: string;
  let otherToken: string;
  let categoryId: number;
  let offeredSkillId: number;
  let requestedSkillId: number;

  beforeAll(async () => {
    app = await createTestApp();

    const sender = await registerUser(app.getHttpServer());
    senderToken = sender.accessToken;

    const receiver = await registerUser(app.getHttpServer());
    receiverToken = receiver.accessToken;

    const other = await registerUser(app.getHttpServer());
    otherToken = other.accessToken;

    const categoriesRes = await request(app.getHttpServer())
      .get(`${API_PREFIX}/categories`)
      .expect(HTTP_STATUS_CODE.OK);

    const categories = categoriesRes.body as CategoryTree[];
    categoryId = categories[0].children[0]?.id ?? categories[0].id;

    const offeredRes = await request(app.getHttpServer())
      .post(`${API_PREFIX}/skills`)
      .set(authHeader(senderToken))
      .send({
        title: `E2E Offered ${Date.now()}`,
        description: 'Offered skill for exchange',
        categoryId,
      })
      .expect(HTTP_STATUS_CODE.CREATED);
    offeredSkillId = (offeredRes.body as Skill).id;

    const requestedRes = await request(app.getHttpServer())
      .post(`${API_PREFIX}/skills`)
      .set(authHeader(receiverToken))
      .send({
        title: `E2E Requested ${Date.now()}`,
        description: 'Requested skill for exchange',
        categoryId,
      })
      .expect(HTTP_STATUS_CODE.CREATED);
    requestedSkillId = (requestedRes.body as Skill).id;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/requests', () => {
    it('should create exchange request', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/requests`)
        .set(authHeader(senderToken))
        .send({
          offeredSkillId,
          requestedSkillId,
        })
        .expect(HTTP_STATUS_CODE.CREATED);

      const body = res.body as RequestEntity;
      expect(body.id).toBeTruthy();
      expect(body.status).toBe(RequestStatus.PENDING);
    });

    it('should return 403 when offered skill does not belong to sender', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/requests`)
        .set(authHeader(otherToken))
        .send({
          offeredSkillId,
          requestedSkillId,
        })
        .expect(HTTP_STATUS_CODE.FORBIDDEN);
    });

    it('should return 400 for self-exchange', async () => {
      const selfSkillRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills`)
        .set(authHeader(otherToken))
        .send({
          title: `E2E Self Skill A ${Date.now()}`,
          description: 'Self exchange A',
          categoryId,
        })
        .expect(HTTP_STATUS_CODE.CREATED);

      const selfSkillBRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/skills`)
        .set(authHeader(otherToken))
        .send({
          title: `E2E Self Skill B ${Date.now()}`,
          description: 'Self exchange B',
          categoryId,
        })
        .expect(HTTP_STATUS_CODE.CREATED);

      await request(app.getHttpServer())
        .post(`${API_PREFIX}/requests`)
        .set(authHeader(otherToken))
        .send({
          offeredSkillId: (selfSkillRes.body as Skill).id,
          requestedSkillId: (selfSkillBRes.body as Skill).id,
        })
        .expect(HTTP_STATUS_CODE.BAD_REQUEST);
    });
  });

  describe('GET /api/requests', () => {
    let requestId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/requests`)
        .set(authHeader(senderToken))
        .send({ offeredSkillId, requestedSkillId })
        .expect(HTTP_STATUS_CODE.CREATED);

      requestId = (res.body as RequestEntity).id;
    });

    it('should return incoming requests for receiver', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/requests`)
        .set(authHeader(receiverToken))
        .expect(HTTP_STATUS_CODE.OK);

      const body = res.body as RequestEntity[];
      expect(Array.isArray(body)).toBe(true);
      const incoming = body.find((r) => r.id === requestId);
      expect(incoming).toBeDefined();
    });

    it('should return outgoing requests for sender', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/requests/outgoing`)
        .set(authHeader(senderToken))
        .expect(HTTP_STATUS_CODE.OK);

      const body = res.body as RequestEntity[];
      expect(Array.isArray(body)).toBe(true);
      const outgoing = body.find((r) => r.id === requestId);
      expect(outgoing).toBeDefined();
    });
  });

  describe('GET /api/requests/:id', () => {
    let requestId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/requests`)
        .set(authHeader(senderToken))
        .send({ offeredSkillId, requestedSkillId })
        .expect(HTTP_STATUS_CODE.CREATED);

      requestId = (res.body as RequestEntity).id;
    });

    it('should return request by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/requests/${requestId}`)
        .expect(HTTP_STATUS_CODE.OK);

      expect((res.body as RequestEntity).id).toBe(requestId);
    });

    it('should return 404 for non-existent request', async () => {
      await request(app.getHttpServer())
        .get(`${API_PREFIX}/requests/999999`)
        .expect(HTTP_STATUS_CODE.NOT_FOUND);
    });
  });

  describe('PATCH /api/requests/:id', () => {
    let requestId: number;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/requests`)
        .set(authHeader(senderToken))
        .send({ offeredSkillId, requestedSkillId })
        .expect(HTTP_STATUS_CODE.CREATED);

      requestId = (res.body as RequestEntity).id;
    });

    it('should update status as receiver', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${API_PREFIX}/requests/${requestId}`)
        .set(authHeader(receiverToken))
        .send({ status: RequestStatus.ACCEPTED })
        .expect(HTTP_STATUS_CODE.OK);

      expect((res.body as RequestEntity).status).toBe(RequestStatus.ACCEPTED);
    });

    it('should return 403 when non-receiver updates status', async () => {
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/requests/${requestId}`)
        .set(authHeader(senderToken))
        .send({ status: RequestStatus.ACCEPTED })
        .expect(HTTP_STATUS_CODE.FORBIDDEN);
    });
  });

  describe('DELETE /api/requests/:id', () => {
    it('should delete request as sender', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/requests`)
        .set(authHeader(senderToken))
        .send({ offeredSkillId, requestedSkillId })
        .expect(HTTP_STATUS_CODE.CREATED);

      const requestId = (createRes.body as RequestEntity).id;

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/requests/${requestId}`)
        .set(authHeader(senderToken))
        .expect(HTTP_STATUS_CODE.OK);

      await request(app.getHttpServer())
        .get(`${API_PREFIX}/requests/${requestId}`)
        .expect(HTTP_STATUS_CODE.NOT_FOUND);
    });

    it('should return 403 when non-sender deletes request', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/requests`)
        .set(authHeader(senderToken))
        .send({ offeredSkillId, requestedSkillId })
        .expect(HTTP_STATUS_CODE.CREATED);

      const requestId = (createRes.body as RequestEntity).id;

      await request(app.getHttpServer())
        .delete(`${API_PREFIX}/requests/${requestId}`)
        .set(authHeader(otherToken))
        .expect(HTTP_STATUS_CODE.FORBIDDEN);
    });
  });
});
