import { Card, CardContent } from "@/components/ui/card";

export function ProgressCard({ progress }: { progress: number }) {
  const value = Math.max(0, Math.min(100, progress));

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-slate-600">{value}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-teal-700" style={{ width: `${value}%` }} />
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">프로젝트 산출물 완성도를 기준으로 갱신됩니다.</p>
      </CardContent>
    </Card>
  );
}
