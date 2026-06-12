import { CircleDashed } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
        <CircleDashed className="h-8 w-8 text-slate-400" />
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
