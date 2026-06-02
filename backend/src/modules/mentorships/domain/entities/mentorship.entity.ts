export enum MentorshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type MentorshipProps = {
  id?: string;
  entrepreneurId: string;
  mentorId: string;
  title: string;
  description: string;
  category: string;
  status?: MentorshipStatus;
  scheduledAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class MentorshipEntity {
  private constructor(private readonly props: Required<MentorshipProps>) {}

  static create(props: MentorshipProps): MentorshipEntity {
    return new MentorshipEntity({
      id: props.id ?? crypto.randomUUID(),
      entrepreneurId: props.entrepreneurId,
      mentorId: props.mentorId,
      title: props.title.trim(),
      description: props.description.trim(),
      category: props.category.trim(),
      status: props.status ?? MentorshipStatus.PENDING,
      scheduledAt: props.scheduledAt ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  toPrimitives(): Required<MentorshipProps> {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get entrepreneurId(): string {
    return this.props.entrepreneurId;
  }

  get mentorId(): string {
    return this.props.mentorId;
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

  get status(): MentorshipStatus {
    return this.props.status;
  }

  get scheduledAt(): Date | null {
    return this.props.scheduledAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
