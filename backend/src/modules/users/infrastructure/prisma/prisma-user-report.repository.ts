import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { UserReportEntity } from '../../domain/entities/user-report.entity';
import { ReportReason } from '../../domain/enums/report-reason.enum';
import {
  CreateUserReportInput,
  UserReportRepository,
} from '../../domain/repositories/user-report.repository';

@Injectable()
export class PrismaUserReportRepository implements UserReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserReportInput): Promise<UserReportEntity> {
    const created = await this.prisma.userReport.create({
      data: {
        reporterId: input.reporterId,
        reportedUserId: input.reportedUserId,
        reason: input.reason,
        description: input.description ?? null,
        status: 'OPEN',
      },
    });

    return this.toEntity(created);
  }

  async hasOpenReport(reporterId: string, reportedUserId: string): Promise<boolean> {
    const existing = await this.prisma.userReport.findFirst({
      where: {
        reporterId,
        reportedUserId,
        status: 'OPEN',
      },
    });

    return Boolean(existing);
  }

  async listOpenReports(): Promise<UserReportEntity[]> {
    const reports = await this.prisma.userReport.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((report) => this.toEntity(report));
  }

  private toEntity(report: {
    id: string;
    reporterId: string;
    reportedUserId: string;
    reason: string;
    description: string | null;
    status: string;
    createdAt: Date;
  }): UserReportEntity {
    return UserReportEntity.create({
      id: report.id,
      reporterId: report.reporterId,
      reportedUserId: report.reportedUserId,
      reason: report.reason as ReportReason,
      description: report.description,
      status: report.status,
      createdAt: report.createdAt,
    });
  }
}
