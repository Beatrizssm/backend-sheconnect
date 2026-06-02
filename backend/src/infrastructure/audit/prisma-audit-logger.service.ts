import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLoggerPort, CreateAuditLogInput } from '../../application/ports/audit-log.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaAuditLoggerService implements AuditLoggerPort {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: CreateAuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        userId: input.userId,
        beforeData: this.toJson(input.beforeData),
        afterData: this.toJson(input.afterData),
        ipAddress: input.ipAddress,
      },
    });
  }

  private toJson(value: unknown): Prisma.InputJsonValue | undefined {
    if (typeof value === 'undefined') {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
