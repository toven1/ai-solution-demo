export function LoadingState({ label = "불러오는 중입니다." }: { label?: string }) {
  return (
    <div className="grid gap-3 rounded-lg border bg-white p-5">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
