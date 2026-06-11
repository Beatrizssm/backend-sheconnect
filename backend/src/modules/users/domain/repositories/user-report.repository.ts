import { ReportReason } from '../enums/report-reason.enum';
import { UserReportEntity } from '../entities/user-report.entity';

export const USER_REPORT_REPOSITORY = Symbol('USER_REPORT_REPOSITORY');

export type CreateUserReportInput = {
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  description?: string;
};

export interface UserReportRepository {
  create(input: CreateUserReportInput): Promise<UserReportEntity>;
  hasOpenReport(reporterId: string, reportedUserId: string): Promise<boolean>;
  listOpenReports(): Promise<UserReportEntity[]>;
}
