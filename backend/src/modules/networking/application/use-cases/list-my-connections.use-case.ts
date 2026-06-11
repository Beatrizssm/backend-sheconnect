import { Inject, Injectable } from '@nestjs/common';
import { UserConnectionEntity } from '../../domain/entities/user-connection.entity';
import {
  ConnectedUserProfile,
  NETWORKING_REPOSITORY,
  NetworkingRepository,
  NetworkingUserProfile,
} from '../../domain/repositories/networking.repository';

export type MyNetworkingResult = {
  connections: UserConnectionEntity[];
  connected: ConnectedUserProfile[];
  recommendations: NetworkingUserProfile[];
};

@Injectable()
export class ListMyConnectionsUseCase {
  constructor(
    @Inject(NETWORKING_REPOSITORY)
    private readonly networking: NetworkingRepository,
  ) {}

  async execute(userId: string): Promise<MyNetworkingResult> {
    const [connections, connected, recommendations] = await Promise.all([
      this.networking.findConnectionsForUser(userId),
      this.networking.findConnectedProfilesForUser(userId),
      this.networking.findRecommendations(userId, 10),
    ]);

    return { connections, connected, recommendations };
  }
}
