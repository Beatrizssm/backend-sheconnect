export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-surface-container-high rounded-xl" />
      <div className="rounded-[32px] bg-white border border-outline-variant/20 p-8 flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full bg-surface-container-high" />
        <div className="h-4 w-40 bg-surface-container-high rounded-lg" />
        <div className="h-3 w-56 bg-surface-container-high rounded-lg" />
      </div>
      <div className="rounded-[32px] bg-white border border-outline-variant/20 p-8 space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-12 bg-surface-container-high rounded-xl" />
        ))}
      </div>
    </div>
  );
}
