import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../domains/user/entities/user.entity';
import { UserRepositoryPort } from '../../domains/user/repositories/user.repository.port';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const createdUser = await this.prisma.user.create({
      data: UserMapper.toPersistence(user),
    });

    return UserMapper.toDomain(createdUser);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    return user ? UserMapper.toDomain(user) : null;
  }
}
