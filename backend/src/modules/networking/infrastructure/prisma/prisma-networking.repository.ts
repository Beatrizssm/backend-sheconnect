import { Injectable } from '@nestjs/common';
import { ConnectionStatus } from '@prisma/client';
import { Role } from '../../../../domains/user/enums/role.enum';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { UserConnectionEntity, UserConnectionStatus } from '../../domain/entities/user-connection.entity';
import {
  ConnectedUserProfile,
  NetworkingRepository,
  NetworkingUserProfile,
} from '../../domain/repositories/networking.repository';

@Injectable()
export class PrismaNetworkingRepository implements NetworkingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findConnectionBetweenUsers(firstUserId: string, secondUserId: string): Promise<UserConnectionEntity | null> {
    const connection = await this.prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: firstUserId, receiverId: secondUserId },
          { requesterId: secondUserId, receiverId: firstUserId },
        ],
      },
    });

    return connection ? this.toEntity(connection) : null;
  }

  async findConnectionById(id: string): Promise<UserConnectionEntity | null> {
    const connection = await this.prisma.userConnection.findUnique({ where: { id } });
    return connection ? this.toEntity(connection) : null;
  }

  async create(connection: UserConnectionEntity): Promise<UserConnectionEntity> {
    const data = connection.toPrimitives();
    const created = await this.prisma.userConnection.create({
      data: {
        id: data.id,
        requesterId: data.requesterId,
        receiverId: data.receiverId,
        status: data.status as ConnectionStatus,
      },
    });

    return this.toEntity(created);
  }

  async updateStatus(id: string, status: UserConnectionStatus): Promise<UserConnectionEntity> {
    const updated = await this.prisma.userConnection.update({
      where: { id },
      data: { status: status as ConnectionStatus },
    });

    return this.toEntity(updated);
  }

  async findConnectionsForUser(userId: string): Promise<UserConnectionEntity[]> {
    const connections = await this.prisma.userConnection.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
    });

    return connections.map((connection) => this.toEntity(connection));
  }

  async findConnectedProfilesForUser(userId: string): Promise<ConnectedUserProfile[]> {
    const connections = await this.prisma.userConnection.findMany({
      where: {
        status: ConnectionStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (connections.length === 0) {
      return [];
    }

    const otherUserIds = connections.map((connection) =>
      connection.requesterId === userId ? connection.receiverId : connection.requesterId,
    );

    const users = await this.prisma.user.findMany({
      where: { id: { in: otherUserIds } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        city: true,
        specialty: true,
        linkedin: true,
        profileImage: true,
      },
    });

    const usersById = new Map(users.map((user) => [user.id, user as NetworkingUserProfile]));

    return connections
      .map((connection) => {
        const otherUserId = connection.requesterId === userId ? connection.receiverId : connection.requesterId;
        const profile = usersById.get(otherUserId);

        if (!profile) {
          return null;
        }

        return {
          connectionId: connection.id,
          status: connection.status as UserConnectionStatus,
          connectedAt: connection.updatedAt,
          profile,
        };
      })
      .filter((item): item is ConnectedUserProfile => item !== null);
  }

  async findRecommendations(userId: string, limit: number): Promise<NetworkingUserProfile[]> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { city: true, specialty: true },
    });
    const existingConnections = await this.prisma.userConnection.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      select: { requesterId: true, receiverId: true },
    });
    const connectedIds = new Set(existingConnections.flatMap((connection) => [connection.requesterId, connection.receiverId]));
    connectedIds.add(userId);

    const users = await this.prisma.user.findMany({
      where: {
        id: { notIn: Array.from(connectedIds) },
        role: { not: Role.ADMIN },
        OR: [
          { city: currentUser?.city ?? undefined },
          { specialty: currentUser?.specialty ?? undefined },
          { role: { in: [Role.MENTOR, Role.INVESTOR, Role.ENTREPRENEUR] } },
        ],
      },
      take: limit,
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        city: true,
        specialty: true,
        linkedin: true,
        profileImage: true,
      },
    });

    return users as NetworkingUserProfile[];
  }

  private toEntity(connection: {
    id: string;
    requesterId: string;
    receiverId: string;
    status: ConnectionStatus;
    createdAt: Date;
    updatedAt: Date;
  }): UserConnectionEntity {
    return UserConnectionEntity.create({
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status as UserConnectionStatus,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    });
  }
}
