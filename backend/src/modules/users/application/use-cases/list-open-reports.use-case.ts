import { Inject, Injectable } from '@nestjs/common';
import { UserReportEntity } from '../../domain/entities/user-report.entity';
import {
  USER_REPORT_REPOSITORY,
  UserReportRepository,
} from '../../domain/repositories/user-report.repository';

@Injectable()
export class ListOpenReportsUseCase {
  constructor(
    @Inject(USER_REPORT_REPOSITORY)
    private readonly reports: UserReportRepository,
  ) {}

  execute(): Promise<UserReportEntity[]> {
    return this.reports.listOpenReports();
  }
}
