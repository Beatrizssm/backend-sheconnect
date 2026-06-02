export type EventRegistrationProps = {
  id?: string;
  userId: string;
  eventId: string;
  createdAt?: Date;
};

export class EventRegistrationEntity {
  private constructor(private readonly props: Required<EventRegistrationProps>) {}

  static create(props: EventRegistrationProps): EventRegistrationEntity {
    return new EventRegistrationEntity({
      id: props.id ?? crypto.randomUUID(),
      userId: props.userId,
      eventId: props.eventId,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  toPrimitives(): Required<EventRegistrationProps> {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
