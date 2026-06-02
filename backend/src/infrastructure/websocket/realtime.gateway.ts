import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../../modules/auth/jwt.strategy';

type RealtimeSocket = Socket & {
  data: {
    userId?: string;
  };
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(@ConnectedSocket() client: RealtimeSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      client.data.userId = payload.sub;
      await client.join(this.getUserRoom(payload.sub));
    } catch (error) {
      this.logger.warn(`Rejected websocket connection: ${error instanceof Error ? error.message : String(error)}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() client: RealtimeSocket): void {
    if (client.data.userId) {
      void client.leave(this.getUserRoom(client.data.userId));
    }
  }

  emitToUser(userId: string, event: string, payload: Record<string, unknown>): void {
    this.server.to(this.getUserRoom(userId)).emit(event, payload);
  }

  private extractToken(client: Socket): string {
    const authToken = client.handshake.auth?.token;
    const queryToken = client.handshake.query?.token;
    const header = client.handshake.headers.authorization;

    if (typeof authToken === 'string') {
      return authToken;
    }

    if (typeof queryToken === 'string') {
      return queryToken;
    }

    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice('Bearer '.length);
    }

    throw new Error('Missing websocket token.');
  }

  private getUserRoom(userId: string): string {
    return `user:${userId}`;
  }
}
