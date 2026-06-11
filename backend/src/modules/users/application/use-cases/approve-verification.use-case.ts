import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../application/ports/audit-log.port';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { VerificationStatus } from '../../domain/enums/verification-status.enum';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository';

@Injectable()
export class ApproveVerificationUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profiles: UserProfileRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(userId: string, adminId: string): Promise<UserProfileEntity> {
    const before = await this.profiles.findById(userId);

    if (!before) {
      throw new NotFoundException('User not found.');
    }

    if (before.toPrimitives().verificationStatus !== VerificationStatus.PENDING) {
      throw new BadRequestException('Somente solicitações pendentes podem ser aprovadas.');
    }

    const after = await this.profiles.approveVerification(userId, adminId);

    await this.auditLogger.log({
      action: 'APPROVE_VERIFICATION',
      entity: 'User',
      entityId: userId,
      userId: adminId,
      beforeData: before.toPrimitives(),
      afterData: after.toPrimitives(),
    });

    return after;
  }
}
