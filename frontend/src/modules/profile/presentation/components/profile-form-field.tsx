import { cn } from '../../../../shared/lib/cn';

type ProfileFormFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
};

export function ProfileFormField({ label, error, children, hint, className }: ProfileFormFieldProps) {
  return (
    <label className={cn('block space-y-2', className)}>
      <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">{label}</span>
      {children}
      {hint && <span className="text-[11px] font-medium text-on-surface-variant/50">{hint}</span>}
      {error && <span className="text-xs font-bold text-red-500">{error}</span>}
    </label>
  );
}

export const profileInputClass =
  'w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-white text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all';
