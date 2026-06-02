import { Role } from '../enums/role.enum';

type UserProps = {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt?: Date;
};

export class UserEntity {
  private constructor(private readonly props: Required<UserProps>) {}

  static create(props: UserProps): UserEntity {
    return new UserEntity({
      id: props.id ?? crypto.randomUUID(),
      name: props.name,
      email: props.email.toLowerCase().trim(),
      password: props.password,
      role: props.role,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get role(): Role {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
