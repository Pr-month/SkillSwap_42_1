import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { jwtConfiguration, TJwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../../auth/auth.types';
import { SocketData } from '../notifications.types';

/**
 * Гарда для WebSocket эндпоинтов.
 *
 * Работает только с сообщениями @SubscribeMessage, так как стандартные
 * методы жизненного цикла (handleConnection / handleDisconnect) обходят
 * механизм гардов NestJS.
 *
 * JWT-токен проверяется один раз в handleConnection через {@link verify}.
 * Сюда попадает уже валидированный пэйлоад из socket.data.user.
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfiguration.KEY) private readonly jwtCfg: TJwtConfig,
  ) {}

  /**
   * Проверяет JWT-токен из рукопожатия WebSocket-соединения,
   * при успехе устанавливает пользователя в `client.data.user`.
   *
   * @param client — Socket.io-клиент, подключающийся к namespace `/notifications`.
   * @returns Верифицированный JWT payload.
   * @throws {WsException} Если токен отсутствует или невалиден.
   */
  async verify(client: SocketData): Promise<JwtPayload> {
    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Unauthorized');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.jwtCfg.accessSecret,
    });

    client.data.user = payload;
    return payload;
  }

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<SocketData>();

    if (!client.data.user) {
      throw new WsException('Unauthorized');
    }

    return true;
  }

  /**
   * Извлекает access JWT из рукопожатия WebSocket подключения.
   *
   * Приоритет источников:
   * 1. Заголовок `Authorization: Bearer <token>` (предпочтительный способ).
   * 2. Query-параметр `token` (fallback для клиентов без поддержки заголовков).
   */
  private extractToken(client: SocketData): string | null {
    const authHeader = client.handshake.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) {
      return queryToken;
    }

    return null;
  }
}
