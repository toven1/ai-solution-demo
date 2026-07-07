import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex gap-3 p-5">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-danger" />
        <div>
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-textSub">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
