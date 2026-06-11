import { User, Role as PrismaRole } from '@prisma/client';
import { UserEntity } from '../../../domains/user/entities/user.entity';
import { Role } from '../../../domains/user/enums/role.enum';

export class UserMapper {
  static toDomain(user: User): UserEntity {
    return UserEntity.create({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as Role,
      createdAt: user.createdAt,
    });
  }

  static toPersistence(user: UserEntity): Pick<User, 'id' | 'name' | 'email' | 'password' | 'role' | 'createdAt'> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as PrismaRole,
      createdAt: user.createdAt,
    };
  }
}
