import { UserProfileEntity } from '../entities/user-profile.entity';
import { VerificationStatus } from '../enums/verification-status.enum';

export const USER_PROFILE_REPOSITORY = Symbol('USER_PROFILE_REPOSITORY');

export type UpdateUserProfileInput = {
  fullName?: string;
  professionalName?: string | null;
  bio?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  website?: string | null;
  profileImage?: string | null;
};

export type RequestVerificationInput = {
  linkedin?: string;
  professionalInstagram?: string;
  companyWebsite?: string;
  notes?: string;
};

export interface UserProfileRepository {
  findById(id: string): Promise<UserProfileEntity | null>;
  update(id: string, data: UpdateUserProfileInput): Promise<UserProfileEntity>;
  submitVerificationRequest(id: string, data: RequestVerificationInput): Promise<UserProfileEntity>;
  approveVerification(userId: string, adminId: string): Promise<UserProfileEntity>;
  rejectVerification(userId: string, adminId: string, reason: string): Promise<UserProfileEntity>;
  listPendingVerifications(): Promise<UserProfileEntity[]>;
  getVerificationStatus(id: string): Promise<VerificationStatus | null>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
}
