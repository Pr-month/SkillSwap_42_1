import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { jwtConfiguration, TJwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../auth.types';

function extractAccessTokenFromRequest(
  req: Request,
  cookieName: string,
): string | null {
  const header = req.headers?.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  const cookieJar = req.cookies as Record<string, unknown> | undefined;
  const fromCookie = cookieJar?.[cookieName];
  if (typeof fromCookie === 'string' && fromCookie.length > 0) {
    return fromCookie;
  }
  return null;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(@Inject(jwtConfiguration.KEY) jwtCfg: TJwtConfig) {
    super({
      jwtFromRequest: (req: Request) =>
        extractAccessTokenFromRequest(req, jwtCfg.accessTokenCookieName),
      secretOrKey: jwtCfg.accessSecret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
