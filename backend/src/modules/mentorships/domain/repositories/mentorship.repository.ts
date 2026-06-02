import { Role } from '../../../../domains/user/enums/role.enum';
import { MentorshipEntity, MentorshipStatus } from '../entities/mentorship.entity';

export const MENTORSHIP_REPOSITORY = Symbol('MENTORSHIP_REPOSITORY');

export type MentorshipListFilters = {
  userId: string;
  userRole: Role;
  status?: MentorshipStatus;
  category?: string;
};

export type UpdateMentorshipStatusInput = {
  status: MentorshipStatus;
  scheduledAt?: Date | null;
};

export interface MentorshipRepository {
  create(mentorship: MentorshipEntity): Promise<MentorshipEntity>;
  findById(id: string): Promise<MentorshipEntity | null>;
  findMany(filters: MentorshipListFilters): Promise<MentorshipEntity[]>;
  updateStatus(id: string, input: UpdateMentorshipStatusInput): Promise<MentorshipEntity>;
}
