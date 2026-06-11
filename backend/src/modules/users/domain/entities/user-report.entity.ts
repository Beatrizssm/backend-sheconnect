import { ReportReason } from '../enums/report-reason.enum';

export type UserReportProps = {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  description: string | null;
  status: string;
  createdAt: Date;
};

export class UserReportEntity {
  private constructor(private readonly props: UserReportProps) {}

  static create(props: UserReportProps): UserReportEntity {
    return new UserReportEntity(props);
  }

  toPrimitives(): UserReportProps {
    return { ...this.props };
  }
}
