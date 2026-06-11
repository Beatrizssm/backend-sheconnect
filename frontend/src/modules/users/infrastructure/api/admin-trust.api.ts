import { api } from '../../../../shared/infrastructure/api/client';
import type { PendingVerificationUser, UserReportItem } from '../../../profile/domain/profile.types';

export const adminTrustService = {
  async listPendingVerifications(): Promise<PendingVerificationUser[]> {
    const { data } = await api.get<PendingVerificationUser[]>('/admin/users/pending-verifications');
    return data;
  },

  async listReports(): Promise<UserReportItem[]> {
    const { data } = await api.get<UserReportItem[]>('/admin/users/reports');
    return data;
  },

  async approveVerification(userId: string) {
    const { data } = await api.patch<{ message: string }>(`/admin/users/${userId}/approve-verification`);
    return data;
  },

  async rejectVerification(userId: string, reason: string) {
    const { data } = await api.patch<{ message: string }>(
      `/admin/users/${userId}/reject-verification`,
      { reason },
    );
    return data;
  },
};
