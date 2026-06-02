import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { StartupEntity, UpdateStartupProps } from '../../domain/entities/startup.entity';
import {
  PaginatedStartups,
  StartupListFilters,
  StartupRepository,
} from '../../domain/repositories/startup.repository';
import { StartupMapper } from '../mappers/startup.mapper';

@Injectable()
export class PrismaStartupRepository implements StartupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(startup: StartupEntity): Promise<StartupEntity> {
    const data = StartupMapper.toPersistence(startup);
    const createdStartup = await this.prisma.startup.create({
      data: {
        id: data.id,
        founderId: data.founderId,
        name: data.name,
        description: data.description,
        category: data.category,
        stage: data.stage,
        website: data.website,
        linkedin: data.linkedin,
        instagram: data.instagram,
        pitch: data.pitch,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });

    return StartupMapper.toDomain(createdStartup);
  }

  async findById(id: string): Promise<StartupEntity | null> {
    const startup = await this.prisma.startup.findUnique({ where: { id } });
    return startup ? StartupMapper.toDomain(startup) : null;
  }

  async findMany(filters: StartupListFilters): Promise<PaginatedStartups> {
    const where: Prisma.StartupWhereInput = {
      ...(filters.category ? { category: { equals: filters.category, mode: 'insensitive' } } : {}),
      ...(filters.stage ? { stage: { equals: filters.stage, mode: 'insensitive' } } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
              { category: { contains: filters.search, mode: 'insensitive' } },
              { stage: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const skip = (filters.page - 1) * filters.limit;
    const [startups, total] = await this.prisma.$transaction([
      this.prisma.startup.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      this.prisma.startup.count({ where }),
    ]);

    return {
      data: startups.map(StartupMapper.toDomain),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async update(id: string, data: UpdateStartupProps): Promise<StartupEntity> {
    const updatedStartup = await this.prisma.startup.update({
      where: { id },
      data,
    });

    return StartupMapper.toDomain(updatedStartup);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.startup.delete({ where: { id } });
  }
}
