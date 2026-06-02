import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { MentorshipEntity } from '../../../domain/entities/mentorship.entity';
import {
  MENTORSHIP_REPOSITORY,
  MentorshipRepository,
} from '../../../domain/repositories/mentorship.repository';

export type GetMentorshipInput = {
  id: string;
  userId: string;
  userRole: Role;
};

@Injectable()
export class GetMentorshipUseCase {
  constructor(
    @Inject(MENTORSHIP_REPOSITORY)
    private readonly mentorships: MentorshipRepository,
  ) {}

  async execute(input: GetMentorshipInput): Promise<MentorshipEntity> {
    const mentorship = await this.mentorships.findById(input.id);

    if (!mentorship) {
      throw new NotFoundException('Mentorship not found.');
    }

    if (!this.canView(mentorship, input.userId, input.userRole)) {
      throw new ForbiddenException('You cannot access this mentorship.');
    }

    return mentorship;
  }

  private canView(mentorship: MentorshipEntity, userId: string, userRole: Role): boolean {
    if (userRole === Role.ADMIN || userRole === Role.INVESTOR) {
      return true;
    }

    if (userRole === Role.ENTREPRENEUR) {
      return mentorship.entrepreneurId === userId;
    }

    if (userRole === Role.MENTOR) {
      return mentorship.mentorId === userId;
    }

    return false;
  }
}
