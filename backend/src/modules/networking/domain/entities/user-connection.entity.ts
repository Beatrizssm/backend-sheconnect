export enum UserConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export type UserConnectionProps = {
  id?: string;
  requesterId: string;
  receiverId: string;
  status?: UserConnectionStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export class UserConnectionEntity {
  private constructor(private readonly props: Required<UserConnectionProps>) {}

  static create(props: UserConnectionProps): UserConnectionEntity {
    if (props.requesterId === props.receiverId) {
      throw new Error('Users cannot connect with themselves.');
    }

    return new UserConnectionEntity({
      id: props.id ?? crypto.randomUUID(),
      requesterId: props.requesterId,
      receiverId: props.receiverId,
      status: props.status ?? UserConnectionStatus.PENDING,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  toPrimitives(): Required<UserConnectionProps> {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get requesterId(): string {
    return this.props.requesterId;
  }

  get receiverId(): string {
    return this.props.receiverId;
  }

  get status(): UserConnectionStatus {
    return this.props.status;
  }
}
