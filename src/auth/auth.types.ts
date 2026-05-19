import { Request } from 'express';
import { User } from '../users/entities/user.entity';

export interface JwtPayload {
  /** Идентификатор пользователя (`users.id`). */
  sub: number;
  email: string;
  /** Значение `users.role_id`. */
  role: number;
}

export interface AuthenticatedRequest extends Request {
  /** Заполняется после проверки access токена. */
  user: JwtPayload;
}

/** Отделение типа токена для различения refresh от access. */
export const REFRESH_JWT_TYPE = 'refresh' as const;

export interface RefreshJwtPayload {
  sub: number;
  email: string;
  role: number;
  type: typeof REFRESH_JWT_TYPE;
}

/** Пользователь, попадающий в `req.user` после успешного прохождения refresh-guard. */
export interface RefreshAuthUser {
  id: number;
  email: string;
  role: number;
}

export interface RefreshAuthenticatedRequest extends Request {
  user: RefreshAuthUser;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}
