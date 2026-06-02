import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { MentorshipEntity, MentorshipStatus } from '../../../domain/entities/mentorship.entity';
import {
  MENTORSHIP_REPOSITORY,
  MentorshipRepository,
} from '../../../domain/repositories/mentorship.repository';

export type ListMentorshipsInput = {
  userId: string;
  userRole: Role;
  status?: MentorshipStatus;
  category?: string;
};

@Injectable()
export class ListMentorshipsUseCase {
  constructor(
    @Inject(MENTORSHIP_REPOSITORY)
    private readonly mentorships: MentorshipRepository,
  ) {}

  execute(input: ListMentorshipsInput): Promise<MentorshipEntity[]> {
    return this.mentorships.findMany(input);
  }
}
