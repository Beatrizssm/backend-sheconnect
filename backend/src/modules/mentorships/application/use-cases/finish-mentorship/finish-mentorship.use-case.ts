import { Injectable } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { MentorshipEntity } from '../../../domain/entities/mentorship.entity';
import { CompleteMentorshipUseCase } from '../complete-mentorship/complete-mentorship.use-case';

type FinishMentorshipInput = {
  id: string;
  userId: string;
  userRole: Role;
};

@Injectable()
export class FinishMentorshipUseCase {
  constructor(private readonly completeMentorship: CompleteMentorshipUseCase) {}

  execute(input: FinishMentorshipInput): Promise<MentorshipEntity> {
    return this.completeMentorship.execute(input);
  }
}
