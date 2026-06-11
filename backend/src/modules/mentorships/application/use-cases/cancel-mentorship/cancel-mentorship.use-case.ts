import { Injectable } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { MentorshipEntity, MentorshipStatus } from '../../../domain/entities/mentorship.entity';
import { ChangeMentorshipStatusUseCase } from '../change-mentorship-status/change-mentorship-status.use-case';

type CancelMentorshipInput = {
  id: string;
  userId: string;
  userRole: Role;
};

@Injectable()
export class CancelMentorshipUseCase {
  constructor(private readonly changeStatus: ChangeMentorshipStatusUseCase) {}

  execute(input: CancelMentorshipInput): Promise<MentorshipEntity> {
    return this.changeStatus.execute({
      ...input,
      status: MentorshipStatus.CANCELADA,
    });
  }
}
