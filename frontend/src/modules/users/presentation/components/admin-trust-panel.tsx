import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../../shared/infrastructure/api/client';
import { cn } from '../../../../shared/lib/cn';
import type { PendingVerificationUser, UserReportItem } from '../../../profile/domain/profile.types';
import { adminTrustService } from '../../infrastructure/api/admin-trust.api';

export function AdminTrustPanel() {
  const [pending, setPending] = useState<PendingVerificationUser[]>([]);
  const [reports, setReports] = useState<UserReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [pendingUsers, openReports] = await Promise.all([
        adminTrustService.listPendingVerifications(),
        adminTrustService.listReports(),
      ]);
      setPending(pendingUsers);
      setReports(openReports);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApprove = async (userId: string) => {
    setError('');
    setSuccess('');
    try {
      const result = await adminTrustService.approveVerification(userId);
      setSuccess(result.message);
      await load();
    } catch (approveError) {
      setError(getApiErrorMessage(approveError));
    }
  };

  const handleReject = async (userId: string) => {
    const reason = rejectReason[userId]?.trim();
    if (!reason) {
      setError('Informe o motivo da rejeição.');
      return;
    }

    setError('');
    setSuccess('');
    try {
      const result = await adminTrustService.rejectVerification(userId, reason);
      setSuccess(result.message);
      await load();
    } catch (rejectError) {
      setError(getApiErrorMessage(rejectError));
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[32px] bg-white border border-outline-variant/20 p-8 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-surface-container-high rounded-lg" />
        <div className="h-20 bg-surface-container-high rounded-xl" />
        <div className="h-20 bg-surface-container-high rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(error || success) && (
        <div
          className={cn(
            'rounded-2xl px-5 py-4 text-sm font-bold border',
            error ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
          )}
        >
          {error || success}
        </div>
      )}

      <section className="rounded-[32px] bg-white border border-outline-variant/20 shadow-sm p-8">
        <h3 className="text-lg font-black text-on-surface mb-4">Verificações pendentes</h3>
        {pending.length === 0 ? (
          <p className="text-sm font-semibold text-on-surface-variant/60">Nenhuma solicitação pendente.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((user) => (
              <div key={user.id} className="rounded-2xl border border-outline-variant/15 p-5 space-y-3">
                <div>
                  <p className="font-bold text-on-surface">{user.fullName}</p>
                  <p className="text-sm text-on-surface-variant/70">{user.email}</p>
                  {user.verificationNotes && (
                    <p className="text-sm font-medium mt-2">{user.verificationNotes}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleApprove(user.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Aprovar
                  </button>
                  <input
                    className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-outline-variant/30 text-sm"
                    placeholder="Motivo da rejeição"
                    value={rejectReason[user.id] ?? ''}
                    onChange={(event) =>
                      setRejectReason((current) => ({ ...current, [user.id]: event.target.value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => void handleReject(user.id)}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[32px] bg-white border border-outline-variant/20 shadow-sm p-8">
        <h3 className="text-lg font-black text-on-surface mb-4">Denúncias abertas</h3>
        {reports.length === 0 ? (
          <p className="text-sm font-semibold text-on-surface-variant/60">Nenhuma denúncia aberta.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-outline-variant/15 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-primary">{report.reason}</p>
                <p className="text-sm font-bold mt-1">
                  Denunciada: {report.reportedUserId.slice(0, 8)}… · Por: {report.reporterId.slice(0, 8)}…
                </p>
                {report.description && (
                  <p className="text-sm text-on-surface-variant/70 mt-2">{report.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
