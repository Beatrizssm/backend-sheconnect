import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateAuditLogInput } from '../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort, DomainEventMessage } from '../../application/ports/event-bus.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditConsumer implements OnModuleInit {
  private readonly logger = new Logger(AuditConsumer.name);

  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.eventBus.registerConsumer((event) => this.persistAuditEvent(event));
  }

  private async persistAuditEvent(event: DomainEventMessage): Promise<void> {
    if (event.eventType === 'AUDIT_LOG') {
      await this.persistExplicitAuditLog(event.payload as unknown as CreateAuditLogInput);
      return;
    }

    if (!event.userId) {
      return;
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          action: event.eventType,
          entity: this.resolveEntity(event.eventType),
          entityId: event.entityId,
          userId: event.userId,
          afterData: this.toJson(event.payload),
          newValue: this.toJson(event.payload),
        },
      });
    } catch (error) {
      this.logger.warn(`Audit consumer skipped event ${event.eventType}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async persistExplicitAuditLog(input: CreateAuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          userId: input.userId,
          beforeData: this.toJson(input.beforeData),
          afterData: this.toJson(input.afterData),
          oldValue: this.toJson(input.oldValue ?? input.beforeData),
          newValue: this.toJson(input.newValue ?? input.afterData),
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });
    } catch (error) {
      this.logger.warn(`Audit consumer skipped AUDIT_LOG: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private resolveEntity(eventType: string): string {
    return eventType.split('_')[0] ?? 'DomainEvent';
  }

  private toJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
