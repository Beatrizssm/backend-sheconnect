import { Injectable } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { MentorshipEntity, MentorshipStatus } from '../../../domain/entities/mentorship.entity';
import { ChangeMentorshipStatusUseCase } from '../change-mentorship-status/change-mentorship-status.use-case';

type ScheduleMentorshipInput = {
  id: string;
  userId: string;
  userRole: Role;
  scheduledAt: Date;
};

@Injectable()
export class ScheduleMentorshipUseCase {
  constructor(private readonly changeStatus: ChangeMentorshipStatusUseCase) {}

  execute(input: ScheduleMentorshipInput): Promise<MentorshipEntity> {
    return this.changeStatus.execute({
      ...input,
      status: MentorshipStatus.AGENDADA,
      scheduledAt: input.scheduledAt,
    });
  }
}
