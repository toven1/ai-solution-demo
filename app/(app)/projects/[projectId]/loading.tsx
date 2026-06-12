import { LoadingState } from "@/components/common/loading-state";

export default function ProjectLoading() {
  return (
    <main className="p-6">
      <LoadingState label="프로젝트 워크스페이스를 불러오는 중입니다." />
    </main>
  );
}
