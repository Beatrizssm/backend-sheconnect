import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../application/ports/audit-log.port';
import { sanitizeText } from '../../../../shared/utils/sanitize-text.util';
import { VerificationStatus } from '../../domain/enums/verification-status.enum';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository';
import { RequestVerificationDto } from '../../infrastructure/dto/request-verification.dto';

@Injectable()
export class RequestVerificationUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profiles: UserProfileRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(userId: string, dto: RequestVerificationDto): Promise<{ message: string }> {
    const before = await this.profiles.findById(userId);

    if (!before) {
      throw new NotFoundException('User profile not found.');
    }

    const status = before.toPrimitives().verificationStatus;

    if (status === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Seu perfil já está verificado.');
    }

    if (status === VerificationStatus.PENDING) {
      throw new BadRequestException('Você já possui uma solicitação de verificação em análise.');
    }

    if (!dto.linkedin && !dto.professionalInstagram && !dto.companyWebsite) {
      throw new BadRequestException(
        'Informe ao menos LinkedIn, Instagram profissional ou website da empresa.',
      );
    }

    const after = await this.profiles.submitVerificationRequest(userId, {
      linkedin: sanitizeText(dto.linkedin, 300),
      professionalInstagram: sanitizeText(dto.professionalInstagram, 120),
      companyWebsite: sanitizeText(dto.companyWebsite, 300),
      notes: sanitizeText(dto.notes, 500),
    });

    await this.auditLogger.log({
      action: 'REQUEST_VERIFICATION',
      entity: 'User',
      entityId: userId,
      userId,
      beforeData: before.toPrimitives(),
      afterData: after.toPrimitives(),
    });

    return { message: 'Solicitação enviada com sucesso.' };
  }
}
