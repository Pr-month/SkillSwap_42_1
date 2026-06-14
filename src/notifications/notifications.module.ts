import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    AuthModule,
  ],
  providers: [NotificationsGateway, NotificationsService, WsJwtGuard],
  exports: [NotificationsService],
})
export class NotificationsModule { }
