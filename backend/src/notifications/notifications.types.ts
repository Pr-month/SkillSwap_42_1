import { Socket } from 'socket.io';
import { JwtPayload } from '../auth/auth.types';

/** Socket.io-клиент с типизированным `data.user` после JWT-аутентификации. */
export interface SocketData extends Socket {
  data: {
    user?: JwtPayload;
  };
}
