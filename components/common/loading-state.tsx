export function LoadingState({ label = "불러오는 중입니다." }: { label?: string }) {
  return (
    <div className="grid gap-3 rounded-lg border border-cardBorder bg-card p-5 shadow-card">
      <div className="h-4 w-40 animate-pulse rounded-sm bg-surfaceStrong" />
      <div className="h-3 w-full animate-pulse rounded-sm bg-surface" />
      <div className="h-3 w-3/4 animate-pulse rounded-sm bg-surface" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
