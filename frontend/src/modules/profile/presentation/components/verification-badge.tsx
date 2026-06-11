import { BadgeCheck, Clock, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '../../../../shared/lib/cn';
import type { VerificationStatus } from '../../domain/profile.types';

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; description: string; className: string; icon: typeof BadgeCheck }
> = {
  NOT_VERIFIED: {
    label: 'Não verificada',
    description: 'Solicite verificação para acessar funcionalidades exclusivas.',
    className: 'bg-amber-50 text-amber-800 border-amber-100',
    icon: ShieldAlert,
  },
  PENDING: {
    label: 'Verificação em análise',
    description: 'Nossa equipe está revisando suas informações profissionais.',
    className: 'bg-sky-50 text-sky-800 border-sky-100',
    icon: Clock,
  },
  VERIFIED: {
    label: 'Perfil verificado',
    description: 'Sua identidade profissional foi confirmada pela SheConnect.',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    icon: BadgeCheck,
  },
  REJECTED: {
    label: 'Verificação recusada',
    description: 'Revise os dados e envie uma nova solicitação.',
    className: 'bg-red-50 text-red-800 border-red-100',
    icon: ShieldX,
  },
};

export function VerificationBadge({
  status,
  reason,
}: {
  status: VerificationStatus;
  reason?: string | null;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-2xl border px-5 py-4', config.className)}>
      <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
        <Icon className="w-4 h-4" />
        {config.label}
        {status === 'VERIFIED' && <span aria-hidden>✓</span>}
      </span>
      <p className="text-sm font-medium mt-2 opacity-90">{config.description}</p>
      {status === 'REJECTED' && reason && (
        <p className="text-sm font-bold mt-2">
          Motivo: <span className="font-semibold">{reason}</span>
        </p>
      )}
    </div>
  );
}
