import { ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function SourceCard({
  title,
  url,
  publisher,
  notes
}: {
  title: string;
  url: string;
  publisher?: string | null;
  notes?: string | null;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-text">{title}</div>
            {publisher ? <div className="mt-1 text-xs text-textFaint">{publisher}</div> : null}
            {notes ? <div className="mt-2 text-xs leading-5 text-warning">{notes}</div> : null}
          </div>
          <a href={url} target="_blank" rel="noreferrer" className="text-textFaint hover:text-text">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
