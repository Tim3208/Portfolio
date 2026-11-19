/**
 * 원본: eodiya/src/components/_common/EmptyState.tsx
 * 기준 커밋: origin/main 20f029a
 * 변경: 원본 회색만 범위 변수로 치환. 문구와 Card 구조는 보존.
 */
import Card from "./Card";

export default function EmptyState({
  title = "선택된 장소가 없습니다.",
  description = "검색 결과 또는 주요 장소 목록에서 하나를 선택해 주세요.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <div className="text-sm font-semibold text-(--eodiya-gray-900)">{title}</div>
      <div className="mt-1 text-sm text-(--eodiya-gray-600)">{description}</div>
    </Card>
  );
}
