import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_LOGGER, AuditLoggerPort } from '../../../../application/ports/audit-log.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../../domains/user/repositories/user.repository.port';
import { sanitizeText } from '../../../../shared/utils/sanitize-text.util';
import { UserReportEntity } from '../../domain/entities/user-report.entity';
import {
  USER_REPORT_REPOSITORY,
  UserReportRepository,
} from '../../domain/repositories/user-report.repository';
import { ReportUserDto } from '../../infrastructure/dto/report-user.dto';

@Injectable()
export class ReportUserUseCase {
  constructor(
    @Inject(USER_REPORT_REPOSITORY)
    private readonly reports: UserReportRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(
    reporterId: string,
    reportedUserId: string,
    dto: ReportUserDto,
  ): Promise<UserReportEntity> {
    if (reporterId === reportedUserId) {
      throw new BadRequestException('Você não pode denunciar a si mesma.');
    }

    const reported = await this.users.findById(reportedUserId);
    if (!reported) {
      throw new NotFoundException('Usuária denunciada não encontrada.');
    }

    const duplicate = await this.reports.hasOpenReport(reporterId, reportedUserId);
    if (duplicate) {
      throw new ConflictException('Você já possui uma denúncia aberta para esta usuária.');
    }

    const report = await this.reports.create({
      reporterId,
      reportedUserId,
      reason: dto.reason,
      description: sanitizeText(dto.description, 1000),
    });

    await this.auditLogger.log({
      action: 'CREATE',
      entity: 'UserReport',
      entityId: report.toPrimitives().id,
      userId: reporterId,
      afterData: report.toPrimitives(),
    });

    return report;
  }
}
