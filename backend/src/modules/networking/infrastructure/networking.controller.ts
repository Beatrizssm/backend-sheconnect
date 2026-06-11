import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/jwt.strategy';
import { JwtGuard } from '../../auth/jwt.guard';
import { VerifiedUserGuard } from '../../auth/verified-user.guard';
import { ChangeConnectionStatusUseCase } from '../application/use-cases/change-connection-status.use-case';
import { ConnectUserUseCase } from '../application/use-cases/connect-user.use-case';
import { ListMyConnectionsUseCase } from '../application/use-cases/list-my-connections.use-case';
import { UserConnectionEntity, UserConnectionStatus } from '../domain/entities/user-connection.entity';
import { ConnectUserDto } from './dto/connect-user.dto';

@UseGuards(JwtGuard)
@Controller('networking')
export class NetworkingController {
  constructor(
    private readonly connectUser: ConnectUserUseCase,
    private readonly changeConnectionStatus: ChangeConnectionStatusUseCase,
    private readonly listMyConnections: ListMyConnectionsUseCase,
  ) {}

  @Post('connect')
  @UseGuards(VerifiedUserGuard)
  async connect(@Body() dto: ConnectUserDto, @CurrentUser() user: AuthenticatedUser) {
    const connection = await this.connectUser.execute({
      requesterId: user.id,
      receiverId: dto.receiverId,
    });

    return this.toResponse(connection);
  }

  @Patch(':id/accept')
  async accept(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const connection = await this.changeConnectionStatus.execute({
      id,
      userId: user.id,
      status: UserConnectionStatus.ACCEPTED,
    });

    return this.toResponse(connection);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const connection = await this.changeConnectionStatus.execute({
      id,
      userId: user.id,
      status: UserConnectionStatus.REJECTED,
    });

    return this.toResponse(connection);
  }

  @Get('my-connections')
  async myConnections(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.listMyConnections.execute(user.id);

    return {
      connections: result.connections.map((connection) => this.toResponse(connection)),
      connected: result.connected.map((item) => ({
        connectionId: item.connectionId,
        status: item.status,
        connectedAt: item.connectedAt.toISOString(),
        profile: item.profile,
      })),
      recommendations: result.recommendations,
    };
  }

  private toResponse(connection: UserConnectionEntity) {
    return connection.toPrimitives();
  }
}
