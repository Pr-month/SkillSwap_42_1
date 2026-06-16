import { Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { SocketData } from './notifications.types';

/**
 * WebSocket gateway для real-time уведомлений.
 *
 * Namespace: `/notifications`.
 *
 * Аутентификация:
 * - При подключении (`handleConnection`) access JWT проверяется через
 *   {@link WsJwtGuard.verify}, так как lifecycle-методы не проходят через
 *   механизм гардов NestJS.
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

  constructor(private readonly jwtGuard: WsJwtGuard) {}

  /**
   * Обрабатывает новое WebSocket подключение к namespace `/notifications`.
   *
   * Стандартные методы жизненного цикла (`handleConnection` / `handleDisconnect`)
   * не проходят через механизм гардов NestJS, поэтому JWT-проверка выполняется
   * через {@link WsJwtGuard.verify}:
   * 1. Извлекает и верифицирует access-токен из handshake.
   * 2. Сохраняет payload в `socket.data.user`.
   * 3. Присоединяет сокет к персональной комнате `user:{sub}`.
   *
   * При отсутствии или невалидности токена соединение немедленно закрывается.
   *
   * @param client — Socket.io-клиент, инициировавший подключение.
   */
  async handleConnection(client: SocketData): Promise<void> {
    try {
      const payload = await this.jwtGuard.verify(client);

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
  handleDisconnect(client: SocketData): void {
    const userId = client.data.user?.sub;
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
  handlePing(client: SocketData): string {
    const { user } = client.data;
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
    if (!this.server) {
      return;
    }
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
