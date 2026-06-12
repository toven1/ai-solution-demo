"use client";

import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";

export default function ProjectError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <ErrorState title="워크스페이스를 불러오지 못했습니다" description="잠시 후 다시 시도하거나 DB 연결 상태를 확인하세요." />
      <Button className="mt-4" onClick={() => reset()}>
        다시 시도
      </Button>
    </main>
  );
}
