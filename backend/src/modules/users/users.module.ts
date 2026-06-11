import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domains/user/repositories/user.repository.port';
import { AuditModule } from '../../infrastructure/audit/audit.module';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PersistenceModule } from '../persistence.module';
import { ApproveVerificationUseCase } from './application/use-cases/approve-verification.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { GetMyProfileUseCase } from './application/use-cases/get-my-profile.use-case';
import { ListOpenReportsUseCase } from './application/use-cases/list-open-reports.use-case';
import { ListPendingVerificationsUseCase } from './application/use-cases/list-pending-verifications.use-case';
import { RejectVerificationUseCase } from './application/use-cases/reject-verification.use-case';
import { ReportUserUseCase } from './application/use-cases/report-user.use-case';
import { RequestVerificationUseCase } from './application/use-cases/request-verification.use-case';
import { UpdateMyProfileUseCase } from './application/use-cases/update-my-profile.use-case';
import { USER_PROFILE_REPOSITORY } from './domain/repositories/user-profile.repository';
import { USER_REPORT_REPOSITORY } from './domain/repositories/user-report.repository';
import { AdminUsersController } from './infrastructure/controllers/admin-users.controller';
import { UsersController } from './infrastructure/controllers/users.controller';
import { PrismaUserProfileRepository } from './infrastructure/prisma/prisma-user-profile.repository';
import { PrismaUserReportRepository } from './infrastructure/prisma/prisma-user-report.repository';

@Module({
  imports: [PersistenceModule, AuditModule],
  controllers: [UsersController, AdminUsersController],
  providers: [
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    RequestVerificationUseCase,
    ChangePasswordUseCase,
    ApproveVerificationUseCase,
    RejectVerificationUseCase,
    ReportUserUseCase,
    ListOpenReportsUseCase,
    ListPendingVerificationsUseCase,
    {
      provide: USER_PROFILE_REPOSITORY,
      useClass: PrismaUserProfileRepository,
    },
    {
      provide: USER_REPORT_REPOSITORY,
      useClass: PrismaUserReportRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class UsersModule {}
