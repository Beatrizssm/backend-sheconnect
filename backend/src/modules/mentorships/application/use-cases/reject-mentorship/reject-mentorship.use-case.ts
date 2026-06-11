import { Injectable } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { MentorshipEntity, MentorshipStatus } from '../../../domain/entities/mentorship.entity';
import { ChangeMentorshipStatusUseCase } from '../change-mentorship-status/change-mentorship-status.use-case';

type RejectMentorshipInput = {
  id: string;
  userId: string;
  userRole: Role;
  rejectionReason?: string | null;
};

@Injectable()
export class RejectMentorshipUseCase {
  constructor(private readonly changeStatus: ChangeMentorshipStatusUseCase) {}

  execute(input: RejectMentorshipInput): Promise<MentorshipEntity> {
    return this.changeStatus.execute({
      ...input,
      status: MentorshipStatus.REJEITADA,
      rejectionReason: input.rejectionReason,
    });
  }
}
