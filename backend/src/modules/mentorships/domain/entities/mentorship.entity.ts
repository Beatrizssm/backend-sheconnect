export enum MentorshipStatus {
  SOLICITADA = 'SOLICITADA',
  EM_ANALISE = 'EM_ANALISE',
  ACEITA = 'ACEITA',
  REJEITADA = 'REJEITADA',
  AGENDADA = 'AGENDADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export type MentorshipProps = {
  id?: string;
  entrepreneurId: string;
  mentorId: string;
  title: string;
  description: string;
  category: string;
  mentorshipArea?: string | null;
  initialMessage?: string | null;
  status?: MentorshipStatus;
  scheduledAt?: Date | null;
  completedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class MentorshipEntity {
  private constructor(private readonly props: Required<MentorshipProps>) {}

  static create(props: MentorshipProps): MentorshipEntity {
    const category = props.category.trim();
    const description = props.description.trim();

    return new MentorshipEntity({
      id: props.id ?? crypto.randomUUID(),
      entrepreneurId: props.entrepreneurId,
      mentorId: props.mentorId,
      title: props.title.trim(),
      description,
      category,
      mentorshipArea: props.mentorshipArea?.trim() || category,
      initialMessage: props.initialMessage?.trim() || description,
      status: props.status ?? MentorshipStatus.SOLICITADA,
      scheduledAt: props.scheduledAt ?? null,
      completedAt: props.completedAt ?? null,
      rejectionReason: props.rejectionReason ?? null,
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

  get mentorshipArea(): string | null {
    return this.props.mentorshipArea;
  }

  get initialMessage(): string | null {
    return this.props.initialMessage;
  }

  get status(): MentorshipStatus {
    return this.props.status;
  }

  get scheduledAt(): Date | null {
    return this.props.scheduledAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get rejectionReason(): string | null {
    return this.props.rejectionReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
