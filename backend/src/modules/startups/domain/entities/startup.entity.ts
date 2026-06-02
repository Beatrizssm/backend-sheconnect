export type StartupProps = {
  id?: string;
  founderId: string;
  name: string;
  description: string;
  category: string;
  stage: string;
  website?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  pitch?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateStartupProps = Partial<
  Pick<StartupProps, 'name' | 'description' | 'category' | 'stage' | 'website' | 'linkedin' | 'instagram' | 'pitch'>
>;

export class StartupEntity {
  private constructor(private readonly props: Required<StartupProps>) {}

  static create(props: StartupProps): StartupEntity {
    return new StartupEntity({
      id: props.id ?? crypto.randomUUID(),
      founderId: props.founderId,
      name: props.name.trim(),
      description: props.description.trim(),
      category: props.category.trim(),
      stage: props.stage.trim(),
      website: StartupEntity.normalizeOptional(props.website),
      linkedin: StartupEntity.normalizeOptional(props.linkedin),
      instagram: StartupEntity.normalizeOptional(props.instagram),
      pitch: StartupEntity.normalizeOptional(props.pitch),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  update(input: UpdateStartupProps): StartupEntity {
    return StartupEntity.create({
      ...this.toPrimitives(),
      ...input,
      updatedAt: new Date(),
    });
  }

  toPrimitives(): Required<StartupProps> {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get founderId(): string {
    return this.props.founderId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get category(): string {
    return this.props.category;
  }

  get stage(): string {
    return this.props.stage;
  }

  get website(): string | null {
    return this.props.website;
  }

  get linkedin(): string | null {
    return this.props.linkedin;
  }

  get instagram(): string | null {
    return this.props.instagram;
  }

  get pitch(): string | null {
    return this.props.pitch;
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
