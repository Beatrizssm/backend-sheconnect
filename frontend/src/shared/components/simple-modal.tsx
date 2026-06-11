import { X } from 'lucide-react';
import { cn } from '../lib/cn';

type SimpleModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function SimpleModal({ open, title, description, onClose, children, className }: SimpleModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-[#181445]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-lg rounded-[32px] bg-white border border-outline-variant/20 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-surface-container-low text-on-surface-variant"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-on-surface pr-10">{title}</h2>
        {description && (
          <p className="text-sm font-medium text-on-surface-variant/70 mt-2">{description}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
