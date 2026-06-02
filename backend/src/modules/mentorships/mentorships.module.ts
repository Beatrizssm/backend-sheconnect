import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domains/user/repositories/user.repository.port';
import { AuditModule } from '../../infrastructure/audit/audit.module';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PersistenceModule } from '../persistence.module';
import { AcceptMentorshipUseCase } from './application/use-cases/accept-mentorship/accept-mentorship.use-case';
import { CancelMentorshipUseCase } from './application/use-cases/cancel-mentorship/cancel-mentorship.use-case';
import { ChangeMentorshipStatusUseCase } from './application/use-cases/change-mentorship-status/change-mentorship-status.use-case';
import { CompleteMentorshipUseCase } from './application/use-cases/complete-mentorship/complete-mentorship.use-case';
import { CreateMentorshipUseCase } from './application/use-cases/create-mentorship/create-mentorship.use-case';
import { GetMentorshipUseCase } from './application/use-cases/get-mentorship/get-mentorship.use-case';
import { ListMentorshipsUseCase } from './application/use-cases/list-mentorships/list-mentorships.use-case';
import { RejectMentorshipUseCase } from './application/use-cases/reject-mentorship/reject-mentorship.use-case';
import { MENTORSHIP_REPOSITORY } from './domain/repositories/mentorship.repository';
import { MentorshipsController } from './infrastructure/controllers/mentorships.controller';
import { PrismaMentorshipRepository } from './infrastructure/prisma/prisma-mentorship.repository';

@Module({
  imports: [PersistenceModule, AuditModule],
  controllers: [MentorshipsController],
  providers: [
    CreateMentorshipUseCase,
    ListMentorshipsUseCase,
    GetMentorshipUseCase,
    ChangeMentorshipStatusUseCase,
    AcceptMentorshipUseCase,
    RejectMentorshipUseCase,
    CompleteMentorshipUseCase,
    CancelMentorshipUseCase,
    {
      provide: MENTORSHIP_REPOSITORY,
      useClass: PrismaMentorshipRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class MentorshipsModule {}
