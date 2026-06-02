import { Injectable } from '@nestjs/common';
import { MentorshipStatus as PrismaMentorshipStatus, Prisma } from '@prisma/client';
import { Role } from '../../../../domains/user/enums/role.enum';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { MentorshipEntity } from '../../domain/entities/mentorship.entity';
import {
  MentorshipListFilters,
  MentorshipRepository,
  UpdateMentorshipStatusInput,
} from '../../domain/repositories/mentorship.repository';
import { MentorshipMapper } from '../mappers/mentorship.mapper';

@Injectable()
export class PrismaMentorshipRepository implements MentorshipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(mentorship: MentorshipEntity): Promise<MentorshipEntity> {
    const data = MentorshipMapper.toPersistence(mentorship);
    const createdMentorship = await this.prisma.mentorship.create({ data });
    return MentorshipMapper.toDomain(createdMentorship);
  }

  async findById(id: string): Promise<MentorshipEntity | null> {
    const mentorship = await this.prisma.mentorship.findUnique({ where: { id } });
    return mentorship ? MentorshipMapper.toDomain(mentorship) : null;
  }

  async findMany(filters: MentorshipListFilters): Promise<MentorshipEntity[]> {
    const where: Prisma.MentorshipWhereInput = {
      ...(filters.status ? { status: filters.status as PrismaMentorshipStatus } : {}),
      ...(filters.category ? { category: { equals: filters.category, mode: 'insensitive' } } : {}),
      ...(filters.userRole === Role.ADMIN ? {} : {}),
      ...(filters.userRole === Role.ENTREPRENEUR ? { entrepreneurId: filters.userId } : {}),
      ...(filters.userRole === Role.MENTOR ? { mentorId: filters.userId } : {}),
    };

    const mentorships = await this.prisma.mentorship.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return mentorships.map(MentorshipMapper.toDomain);
  }

  async updateStatus(id: string, input: UpdateMentorshipStatusInput): Promise<MentorshipEntity> {
    const mentorship = await this.prisma.mentorship.update({
      where: { id },
      data: {
        status: input.status as PrismaMentorshipStatus,
        ...(input.scheduledAt !== undefined ? { scheduledAt: input.scheduledAt } : {}),
      },
    });

    return MentorshipMapper.toDomain(mentorship);
  }
}
