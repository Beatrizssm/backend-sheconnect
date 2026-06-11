export type VerificationStatus = 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type UserProfile = {
  id: string;
  email: string;
  role: 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTOR';
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
  verifiedAt: string | null;
  verificationReason: string | null;
  verificationNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfilePayload = {
  fullName: string;
  professionalName?: string;
  bio?: string;
  area?: string;
  city?: string;
  state?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  profileImage?: string | null;
};

export type RequestVerificationPayload = {
  linkedin?: string;
  professionalInstagram?: string;
  companyWebsite?: string;
  notes?: string;
};

export type PendingVerificationUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  linkedin: string | null;
  instagram: string | null;
  website: string | null;
  verificationNotes: string | null;
  verificationStatus: VerificationStatus;
  updatedAt: string;
};

export type UserReportItem = {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
};
