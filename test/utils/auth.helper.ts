import { Server } from 'http';
import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../src/common/constants/http-status-code.constant';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  API_PREFIX,
  defaultRegisterPayload,
  SEED_USER_PASSWORD,
} from './test-data';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult extends AuthTokens {
  user: {
    id: number;
    email: string;
    name: string;
    avatar?: string | null;
  };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export function decodeAccessTokenSub(accessToken: string): number {
  const payload = JSON.parse(
    Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8'),
  ) as { sub: number };
  return payload.sub;
}

export async function registerUser(
  server: Server,
  overrides: Record<string, unknown> = {},
): Promise<RegisterResult> {
  const payload = defaultRegisterPayload(overrides);
  const res = await request(server)
    .post(`${API_PREFIX}/auth/register`)
    .send(payload)
    .expect(HTTP_STATUS_CODE.CREATED);

  const body = res.body as AuthTokens;
  const userId = decodeAccessTokenSub(body.accessToken);

  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    user: {
      id: userId,
      email: payload.email,
      name: payload.name,
    },
  };
}

export async function loginUser(
  server: Server,
  email: string,
  password: string,
): Promise<AuthTokens> {
  const res = await request(server)
    .post(`${API_PREFIX}/auth/login`)
    .send({ email, password })
    .expect(HTTP_STATUS_CODE.OK);

  return res.body as AuthTokens;
}

export async function loginAsAdmin(server: Server): Promise<AuthTokens> {
  return loginUser(server, ADMIN_EMAIL, ADMIN_PASSWORD);
}

export async function loginAsSeededUser(
  server: Server,
  email: string,
): Promise<AuthTokens> {
  return loginUser(server, email, SEED_USER_PASSWORD);
}
