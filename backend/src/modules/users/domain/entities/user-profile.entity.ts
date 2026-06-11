import { Role } from '../../../../domains/user/enums/role.enum';
import { VerificationStatus } from '../enums/verification-status.enum';

export type UserProfileProps = {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  professionalName: string | null;
  bio: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  linkedin: string | null;
  instagram: string | null;
  website: string | null;
  profileImage: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  verificationReason: string | null;
  verificationNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class UserProfileEntity {
  private constructor(private readonly props: UserProfileProps) {}

  static create(props: UserProfileProps): UserProfileEntity {
    return new UserProfileEntity(props);
  }

  toPrimitives(): UserProfileProps {
    return { ...this.props };
  }
}
