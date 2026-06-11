import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../../shared/lib/cn';

export function Field({
  label,
  placeholder,
  type = 'text',
  icon,
  name,
}: {
  label: string;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  name?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30">{icon}</div>}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          className={cn(
            'w-full py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold',
            icon ? 'pl-11 pr-5' : 'px-5',
          )}
          required
        />
      </div>
    </div>
  );
}

export function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={isSubmitting}
      className="w-full mt-4 bg-primary text-white font-black py-4 rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
    >
      {isSubmitting ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {label} <ArrowRight className="w-4 h-4" />
        </>
      )}
    </motion.button>
  );
}

export function RoleCardAuth({
  isSelected,
  onClick,
  icon,
  label,
}: {
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-4 border-2 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-1',
        isSelected
          ? 'border-primary bg-primary/5 text-primary shadow-inner'
          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low',
      )}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">{label}</span>
    </button>
  );
}
