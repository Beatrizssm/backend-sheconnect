export const AUDIT_LOGGER = Symbol('AUDIT_LOGGER');

export interface CreateAuditLogInput {
  action: string;
  entity: string;
  entityId?: string;
  userId: string;
  beforeData?: unknown;
  afterData?: unknown;
  ipAddress?: string;
}

export type AuditLogInput = CreateAuditLogInput;

export interface AuditLoggerPort {
  log(input: CreateAuditLogInput): Promise<void>;
}
