import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex gap-3 p-5">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
        <div>
          <h3 className="text-sm font-semibold text-red-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-red-700">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
