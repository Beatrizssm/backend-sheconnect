import { Module } from '@nestjs/common';

import { USER_REPOSITORY } from '../../domains/user/repositories/user.repository.port';

import { AuditLoggerModule } from '../../infrastructure/audit/audit-logger.module';

import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

import { JwtAuthModule } from '../auth/jwt-auth.module';

import { PersistenceModule } from '../persistence.module';

import { AcceptMentorshipUseCase } from './application/use-cases/accept-mentorship/accept-mentorship.use-case';

import { CancelMentorshipUseCase } from './application/use-cases/cancel-mentorship/cancel-mentorship.use-case';

import { ChangeMentorshipStatusUseCase } from './application/use-cases/change-mentorship-status/change-mentorship-status.use-case';

import { CompleteMentorshipUseCase } from './application/use-cases/complete-mentorship/complete-mentorship.use-case';

import { CreateMentorshipUseCase } from './application/use-cases/create-mentorship/create-mentorship.use-case';

import { FinishMentorshipUseCase } from './application/use-cases/finish-mentorship/finish-mentorship.use-case';

import { GetMentorshipUseCase } from './application/use-cases/get-mentorship/get-mentorship.use-case';

import { ListMentorshipsUseCase } from './application/use-cases/list-mentorships/list-mentorships.use-case';

import { RejectMentorshipUseCase } from './application/use-cases/reject-mentorship/reject-mentorship.use-case';

import { ScheduleMentorshipUseCase } from './application/use-cases/schedule-mentorship/schedule-mentorship.use-case';

import { StartMentorshipUseCase } from './application/use-cases/start-mentorship/start-mentorship.use-case';

import { MENTORSHIP_REPOSITORY } from './domain/repositories/mentorship.repository';

import { MentorshipsController } from './infrastructure/controllers/mentorships.controller';

import { PrismaMentorshipRepository } from './infrastructure/prisma/prisma-mentorship.repository';



@Module({

  imports: [PersistenceModule, AuditLoggerModule, JwtAuthModule],

  controllers: [MentorshipsController],

  providers: [

    CreateMentorshipUseCase,

    ListMentorshipsUseCase,

    GetMentorshipUseCase,

    ChangeMentorshipStatusUseCase,

    AcceptMentorshipUseCase,

    RejectMentorshipUseCase,

    ScheduleMentorshipUseCase,

    StartMentorshipUseCase,

    CompleteMentorshipUseCase,

    FinishMentorshipUseCase,

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


