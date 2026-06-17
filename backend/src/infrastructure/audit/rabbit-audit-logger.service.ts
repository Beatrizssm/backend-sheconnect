import { Inject, Injectable } from '@nestjs/common';
import { AuditLoggerPort, CreateAuditLogInput } from '../../application/ports/audit-log.port';
import { EVENT_BUS, EventBusPort } from '../../application/ports/event-bus.port';

@Injectable()
export class RabbitAuditLoggerService implements AuditLoggerPort {
  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
  ) {}

  async log(input: CreateAuditLogInput): Promise<void> {
    await this.eventBus.publish('AUDIT_LOG', {
      userId: input.userId,
      entityId: input.entityId,
      payload: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        userId: input.userId,
        beforeData: input.beforeData,
        afterData: input.afterData,
        oldValue: input.oldValue,
        newValue: input.newValue,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }
}
