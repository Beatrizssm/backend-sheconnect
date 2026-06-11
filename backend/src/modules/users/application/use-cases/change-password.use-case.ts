import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../application/ports/audit-log.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../../domains/user/repositories/user.repository.port';
import { PasswordHasher } from '../../../../shared/utils/password-hasher';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository';
import { ChangePasswordDto } from '../../infrastructure/dto/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profiles: UserProfileRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuária não encontrada.');
    }

    const currentMatches = await PasswordHasher.compare(dto.currentPassword, user.password);
    if (!currentMatches) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('A nova senha deve ser diferente da senha atual.');
    }

    const hashedPassword = await PasswordHasher.hash(dto.newPassword);
    await this.profiles.updatePassword(userId, hashedPassword);

    await this.auditLogger.log({
      action: 'CHANGE_PASSWORD',
      entity: 'User',
      entityId: userId,
      userId,
      afterData: { passwordChanged: true },
    });

    return { message: 'Senha alterada com sucesso.' };
  }
}
