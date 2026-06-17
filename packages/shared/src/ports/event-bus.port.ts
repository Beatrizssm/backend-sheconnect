export const EVENT_BUS = Symbol('EVENT_BUS');

export type DomainEventType =
  | 'USER_REGISTERED'
  | 'USER_LOGIN'
  | 'AUDIT_LOG'
  | 'STARTUP_CREATED'
  | 'STARTUP_UPDATED'
  | 'STARTUP_DELETED'
  | 'MENTORSHIP_REQUESTED'
  | 'MENTORSHIP_CREATED'
  | 'MENTORSHIP_ACCEPTED'
  | 'MENTORSHIP_REJECTED'
  | 'MENTORSHIP_CANCELLED'
  | 'MENTORSHIP_COMPLETED'
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_DELETED'
  | 'EVENT_REGISTERED'
  | 'EVENT_UNREGISTERED'
  | 'USER_CONNECTED'
  | 'NEW_MESSAGE'
  | 'user_created'
  | 'startup_created'
  | 'mentorship_requested';

export type DomainEventMessage<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventType: DomainEventType;
  userId?: string;
  entityId?: string;
  payload: TPayload;
  createdAt: string;
};

export type DomainEventConsumer = (event: DomainEventMessage) => Promise<void> | void;

export interface EventBusPort {
  publish<TPayload extends Record<string, unknown>>(
    eventType: DomainEventType,
    data: {
      userId?: string;
      entityId?: string;
      payload: TPayload;
    },
  ): Promise<void>;
  registerConsumer(consumer: DomainEventConsumer): Promise<void>;
}
