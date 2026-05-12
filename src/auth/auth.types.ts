import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
  role: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
