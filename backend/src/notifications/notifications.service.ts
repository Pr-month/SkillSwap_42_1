import { Injectable } from '@nestjs/common';
import { Request } from '../requests/entities/request.entity';
import { NotificationsGateway } from './notifications.gateway';

/** Общие поля payload уведомлений, связанных с заявкой на обмен навыками. */
interface BaseRequestPayload {
  requestId: number;
  offeredSkillTitle: string;
  requestedSkillTitle: string;
}

/** Тело WebSocket-события `notification:new-request`. */
export interface NewRequestPayload extends BaseRequestPayload {
  senderId: number;
  senderName: string;
}

/** Тело WebSocket-события `notification:request-updated`. */
export interface RequestStatusPayload extends BaseRequestPayload {
  status: string;
}

/**
 * Сервис real-time уведомлений через WebSocket namespace `/notifications`.
 *
 * Формирует payload и делегирует доставку в {@link NotificationsGateway},
 * который отправляет события в персональную комнату `user:{id}`.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  /**
   * Уведомляет получателя о новой входящей заявке на обмен навыками.
   *
   * Событие отправляется только получателю (`request.receiver`) по
   * каналу WebSocket `notification:new-request`.
   *
   * @param request — сохранённая заявка с загруженными связями `sender`,
   * `receiver`, `offeredSkill` и `requestedSkill`.
   */
  notifyNewRequest(request: Request): void {
    const payload: NewRequestPayload = {
      requestId: request.id,
      senderId: request.sender.id,
      senderName: request.sender.name,
      offeredSkillTitle: request.offeredSkill.title,
      requestedSkillTitle: request.requestedSkill.title,
    };

    this.gateway.sendToUser(
      request.receiver.id,
      'notification:new-request',
      payload,
    );
  }

  /**
   * Уведомляет отправителя об изменении статуса его заявки.
   *
   * Событие отправляется только отправителю (`request.sender`) по
   * каналу WebSocket `notification:request-updated`.
   *
   * @param request — актуальная заявка с загруженными связями `sender`,
   * `receiver`, `offeredSkill` и `requestedSkill`.
   */
  notifyRequestStatusChanged(request: Request): void {
    const payload: RequestStatusPayload = {
      requestId: request.id,
      status: request.status,
      offeredSkillTitle: request.offeredSkill.title,
      requestedSkillTitle: request.requestedSkill.title,
    };

    this.gateway.sendToUser(
      request.sender.id,
      'notification:request-updated',
      payload,
    );
  }
}
