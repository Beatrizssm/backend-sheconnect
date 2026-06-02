import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditLogFilters = {
  action?: string;
  entity?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
};

@Injectable()
export class AuditLogQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: AuditLogFilters) {
    const where = this.buildWhere(filters);
    const skip = (filters.page - 1) * filters.limit;
    const [logs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async findById(id: string) {
    const log = await this.prisma.auditLog.findUnique({ where: { id } });

    if (!log) {
      throw new NotFoundException('Audit log not found.');
    }

    return log;
  }

  private buildWhere(filters: AuditLogFilters): Prisma.AuditLogWhereInput {
    return {
      ...(filters.action ? { action: { equals: filters.action, mode: 'insensitive' } } : {}),
      ...(filters.entity ? { entity: { equals: filters.entity, mode: 'insensitive' } } : {}),
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.startDate || filters.endDate
        ? {
            createdAt: {
              ...(filters.startDate ? { gte: filters.startDate } : {}),
              ...(filters.endDate ? { lte: filters.endDate } : {}),
            },
          }
        : {}),
    };
  }
}
