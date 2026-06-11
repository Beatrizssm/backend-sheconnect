import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../application/ports/audit-log.port';
import { sanitizeText } from '../../../../shared/utils/sanitize-text.util';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { VerificationStatus } from '../../domain/enums/verification-status.enum';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository';

@Injectable()
export class RejectVerificationUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profiles: UserProfileRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(userId: string, adminId: string, reason: string): Promise<UserProfileEntity> {
    const before = await this.profiles.findById(userId);

    if (!before) {
      throw new NotFoundException('User not found.');
    }

    if (before.toPrimitives().verificationStatus !== VerificationStatus.PENDING) {
      throw new BadRequestException('Somente solicitações pendentes podem ser rejeitadas.');
    }

    const sanitizedReason = sanitizeText(reason, 500);
    if (!sanitizedReason) {
      throw new BadRequestException('Informe o motivo da rejeição.');
    }

    const after = await this.profiles.rejectVerification(userId, adminId, sanitizedReason);

    await this.auditLogger.log({
      action: 'REJECT_VERIFICATION',
      entity: 'User',
      entityId: userId,
      userId: adminId,
      beforeData: before.toPrimitives(),
      afterData: after.toPrimitives(),
    });

    return after;
  }
}
