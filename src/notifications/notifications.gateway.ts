import { Inject, Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { jwtConfiguration, TJwtConfig } from '../config/jwt.config';
import { JwtPayload } from '../auth/auth.types';
import { WsJwtGuard } from './guards/ws-jwt.guard';

/** Данные, сохраняемые в `socket.data` после успешной аутентификации через JWT. */
interface SocketData {
  user?: JwtPayload;
}

/**
 * Извлекает access JWT из рукопожатия WebSocket подключения.
 *
 * Приоритет источников:
 * 1. Заголовок `Authorization: Bearer <token>` (предпочтительный способ).
 * 2. Query-параметр `token` (fallback для клиентов без поддержки заголовков).
 *
 * @param client — Socket.io-клиент, подключающийся к namespace `/notifications`.
 * @returns Сырая строка JWT или `null`, если токен не передан.
 */
function extractToken(client: Socket): string | null {
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

/**
 * WebSocket gateway для real-time уведомлений.
 *
 * Namespace: `/notifications`.
 *
 * Аутентификация:
 * - При подключении (`handleConnection`) access JWT проверяется вручную через
 *   {@link JwtService}, так как lifecycle-методы не проходят через гарды NestJS.
 * - Для `@SubscribeMessage`-обработчиков действует {@link WsJwtGuard}, который
 *   проверяет наличие `socket.data.user`, установленного при подключении.
 *
 * После успешной аутентификации сокет присоединяется к комнате `user:{id}`,
 * что позволяет адресно доставлять события конкретному пользователю.
 */
@UseGuards(WsJwtGuard)
@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfiguration.KEY) private readonly jwtCfg: TJwtConfig,
  ) {}

  /**
   * Обрабатывает новое WebSocket подключение к namespace `/notifications`.
   *
   * Стандартные методы жизненного цикла (`handleConnection` / `handleDisconnect`)
   * не проходят через механизм гардов NestJS, поэтому JWT-проверка выполняется
   * здесь вручную:
   * 1. Извлекает access-токен из handshake.
   * 2. Верифицирует его через {@link JwtService} с `accessSecret`.
   * 3. Сохраняет payload в `socket.data.user`.
   * 4. Присоединяет сокет к персональной комнате `user:{sub}`.
   *
   * При отсутствии или невалидности токена соединение немедленно закрывается.
   *
   * @param client — Socket.io-клиент, инициировавший подключение.
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = extractToken(client);
      if (!token) {
        this.logger.warn(`Connection rejected (no token): ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtCfg.accessSecret,
      });

      (client.data as SocketData).user = payload;

      // Каждый авторизованный сокет присоединяется к персональной комнате,
      // чтобы сервис мог адресно слать уведомления конкретному пользователю.
      await client.join(`user:${payload.sub}`);

      this.logger.log(`Client connected: ${client.id} (userId=${payload.sub})`);
    } catch {
      this.logger.warn(`Connection rejected (invalid token): ${client.id}`);
      client.disconnect();
    }
  }

  /**
   * Обрабатывает отключение WebSocket-клиента.
   *
   * Логирует `client.id` и, если доступен, `userId` из `socket.data.user`.
   *
   * @param client — Socket.io-клиент, разорвавший соединение.
   */
  handleDisconnect(client: Socket): void {
    const userId = (client.data as SocketData).user?.sub;
    this.logger.log(
      `Client disconnected: ${client.id}` +
        (userId === undefined ? '' : ` (userId=${userId})`),
    );
  }

  /**
   * Служебный обработчик для проверки живости WebSocket-соединения.
   *
   * Клиент отправляет событие `ping`, сервер отвечает строкой `pong`.
   * {@link WsJwtGuard} гарантирует, что `socket.data.user` уже заполнен
   * при успешном подключении.
   *
   * @param client — аутентифицированный Socket.io-клиент.
   * @returns Строка `pong (userId={id})` для подтверждения связи.
   */
  @SubscribeMessage('ping')
  handlePing(client: Socket): string {
    const { user } = client.data as SocketData;
    return `pong (userId=${user?.sub ?? 'unknown'})`;
  }

  /**
   * Отправляет WebSocket событие конкретному пользователю по его ID.
   *
   * Доставка выполняется в комнату `user:{userId}`, к которой сокет пользователя
   * присоединяется при успешном `handleConnection`. Используется из
   * {@link NotificationsService} для push-уведомлений о заявках.
   *
   * @param userId — идентификатор получателя (`users.id`).
   * @param event — имя WebSocket события (например, `notification:new-request`).
   * @param data — сериализуемое тело события.
   */
  sendToUser(userId: number, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
