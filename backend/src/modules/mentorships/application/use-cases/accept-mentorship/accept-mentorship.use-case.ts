import { Injectable } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { MentorshipEntity, MentorshipStatus } from '../../../domain/entities/mentorship.entity';
import { ChangeMentorshipStatusUseCase } from '../change-mentorship-status/change-mentorship-status.use-case';

type AcceptMentorshipInput = {
  id: string;
  userId: string;
  userRole: Role;
  scheduledAt?: Date | null;
};

@Injectable()
export class AcceptMentorshipUseCase {
  constructor(private readonly changeStatus: ChangeMentorshipStatusUseCase) {}

  execute(input: AcceptMentorshipInput): Promise<MentorshipEntity> {
    return this.changeStatus.execute({
      ...input,
      status: MentorshipStatus.ACCEPTED,
    });
  }
}
