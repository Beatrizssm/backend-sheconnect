import { Role } from '../../../../domains/user/enums/role.enum';
import { UserConnectionEntity, UserConnectionStatus } from '../entities/user-connection.entity';

export const NETWORKING_REPOSITORY = Symbol('NETWORKING_REPOSITORY');

export type NetworkingUserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio: string | null;
  city: string | null;
  specialty: string | null;
  linkedin: string | null;
  profileImage: string | null;
};

export type ConnectedUserProfile = {
  connectionId: string;
  status: UserConnectionStatus;
  connectedAt: Date;
  profile: NetworkingUserProfile;
};

export interface NetworkingRepository {
  findConnectionBetweenUsers(firstUserId: string, secondUserId: string): Promise<UserConnectionEntity | null>;
  findConnectionById(id: string): Promise<UserConnectionEntity | null>;
  create(connection: UserConnectionEntity): Promise<UserConnectionEntity>;
  updateStatus(id: string, status: UserConnectionStatus): Promise<UserConnectionEntity>;
  findConnectionsForUser(userId: string): Promise<UserConnectionEntity[]>;
  findConnectedProfilesForUser(userId: string): Promise<ConnectedUserProfile[]>;
  findRecommendations(userId: string, limit: number): Promise<NetworkingUserProfile[]>;
}
