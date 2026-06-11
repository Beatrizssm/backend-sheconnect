import { useState } from 'react';
import { SimpleModal } from '../../../../shared/components/simple-modal';
import { getApiErrorMessage } from '../../../../shared/infrastructure/api/client';
import { profileService } from '../../infrastructure/api/profile.api';
import { REPORT_REASONS } from '../../domain/report.constants';
import { ProfileFormField, profileInputClass } from './profile-form-field';

type ReportUserModalProps = {
  open: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess?: (message: string) => void;
};

export function ReportUserModal({ open, userId, userName, onClose, onSuccess }: ReportUserModalProps) {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].value);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setError('');
    setDescription('');
    setReason(REPORT_REASONS[0].value);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await profileService.reportUser(userId, {
        reason,
        description: description.trim() || undefined,
      });
      onSuccess?.(result.message);
      handleClose();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SimpleModal
      open={open}
      title="Denunciar perfil"
      description={`Ajude a manter a SheConnect segura. Sua denúncia sobre ${userName} será analisada pela moderação.`}
      onClose={handleClose}
    >
      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <ProfileFormField label="Motivo">
          <select
            className={profileInputClass}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          >
            {REPORT_REASONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </ProfileFormField>
        <ProfileFormField
          label="Descrição (opcional)"
          hint="Conte o que aconteceu para ajudar na análise."
        >
          <textarea
            rows={4}
            maxLength={1000}
            className={`${profileInputClass} resize-y min-h-[100px]`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Detalhes da denúncia..."
          />
        </ProfileFormField>
        {error && <p className="text-xs font-bold text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar denúncia'}
        </button>
      </form>
    </SimpleModal>
  );
}
