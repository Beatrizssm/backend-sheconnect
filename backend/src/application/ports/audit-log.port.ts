export const AUDIT_LOGGER = Symbol('AUDIT_LOGGER');

export interface CreateAuditLogInput {
  action: string;
  entity: string;
  entityId?: string;
  userId: string;
  beforeData?: unknown;
  afterData?: unknown;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditLogInput = CreateAuditLogInput;

export interface AuditLoggerPort {
  log(input: CreateAuditLogInput): Promise<void>;
}
