import React from 'react';

export function MetricCard({
  label,
  value,
  sublabel,
  icon,
  trend,
}: {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-[30px] border border-outline-variant/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-default">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="p-3 rounded-2xl bg-surface-container-low w-fit">{icon}</div>
        {trend && (
          <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-on-surface tracking-tight">{value}</p>
      <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-2 opacity-50">{sublabel}</p>
    </div>
  );
}
