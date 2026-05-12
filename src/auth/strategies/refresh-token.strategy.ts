import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { jwtConfiguration, TJwtConfig } from '../../config/jwt.config';
import { User } from '../../users/entities/user.entity';
import {
  REFRESH_JWT_TYPE,
  RefreshAuthUser,
  RefreshJwtPayload,
} from '../auth.types';

function extractRefreshTokenFromRequest(
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
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly refreshCookieName: string;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(jwtConfiguration.KEY)
    jwtCfg: TJwtConfig,
  ) {
    super({
      jwtFromRequest: (req: Request) =>
        extractRefreshTokenFromRequest(req, jwtCfg.refreshTokenCookieName),
      secretOrKey: jwtCfg.refreshSecret,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
    this.refreshCookieName = jwtCfg.refreshTokenCookieName;
  }

  async validate(
    req: Request,
    payload: RefreshJwtPayload,
  ): Promise<RefreshAuthUser> {
    if (payload.type !== REFRESH_JWT_TYPE) {
      throw new UnauthorizedException();
    }

    const rawToken = extractRefreshTokenFromRequest(
      req,
      this.refreshCookieName,
    );
    if (!rawToken) {
      throw new UnauthorizedException();
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user?.refreshToken) {
      throw new UnauthorizedException();
    }

    const matches = await bcrypt.compare(rawToken, user.refreshToken);
    if (!matches) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.roleId,
    };
  }
}
