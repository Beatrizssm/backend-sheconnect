export type EventProps = {
  id?: string;
  title: string;
  description: string;
  category: string;
  location?: string | null;
  isOnline?: boolean;
  meetingLink?: string | null;
  eventDate: Date;
  maxAttendees?: number | null;
  organizerId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateEventProps = Partial<
  Pick<EventProps, 'title' | 'description' | 'category' | 'location' | 'isOnline' | 'meetingLink' | 'eventDate' | 'maxAttendees'>
>;

export class EventEntity {
  private constructor(private readonly props: Required<EventProps>) {}

  static create(props: EventProps): EventEntity {
    return new EventEntity({
      id: props.id ?? crypto.randomUUID(),
      title: props.title.trim(),
      description: props.description.trim(),
      category: props.category.trim(),
      location: EventEntity.normalizeOptional(props.location),
      isOnline: props.isOnline ?? false,
      meetingLink: EventEntity.normalizeOptional(props.meetingLink),
      eventDate: props.eventDate,
      maxAttendees: props.maxAttendees ?? null,
      organizerId: props.organizerId,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  update(input: UpdateEventProps): EventEntity {
    return EventEntity.create({
      ...this.toPrimitives(),
      ...input,
      updatedAt: new Date(),
    });
  }

  toPrimitives(): Required<EventProps> {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get category(): string {
    return this.props.category;
  }

  get location(): string | null {
    return this.props.location;
  }

  get isOnline(): boolean {
    return this.props.isOnline;
  }

  get meetingLink(): string | null {
    return this.props.meetingLink;
  }

  get eventDate(): Date {
    return this.props.eventDate;
  }

  get maxAttendees(): number | null {
    return this.props.maxAttendees;
  }

  get organizerId(): string {
    return this.props.organizerId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private static normalizeOptional(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }
}
