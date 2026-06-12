import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from '../../auth/auth.types';

interface SocketData {
  user?: JwtPayload;
}

/**
 * Гарда для WebSocket эндпоинтов.
 *
 * Работает только с сообщениями @SubscribeMessage, так как стандартные
 * методы жизненного цикла (handleConnection / handleDisconnect) обходят
 * механизм гардов NestJS.
 *
 * JWT-токен проверяется один раз в handleConnection (NotificationsGateway).
 * Сюда попадает уже валидированный пэйлоад из socket.data.user.
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const { user } = client.data as SocketData;

    if (!user) {
      throw new WsException('Unauthorized');
    }

    return true;
  }
}
