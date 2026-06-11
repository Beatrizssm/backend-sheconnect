export function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-on-surface">{value}</p>
    </div>
  );
}
