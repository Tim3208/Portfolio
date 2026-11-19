/**
 * 원본: eodiya/src/components/CampusMapCP/SearchResultItem.tsx
 * 기준 커밋: origin/main 20f029a
 * 변경: 데모 폴더의 검색 타입으로 경로를 바꾸고 원본 회색을 범위 변수로 치환.
 */
import type { PlaceSearchResult } from "./search";

export default function SearchResultItem({ result }: { result: PlaceSearchResult }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <div className="text-sm font-semibold text-(--eodiya-gray-900)">{result.title}</div>
      <div className="text-xs text-(--eodiya-gray-600)">{result.subtitle}</div>
    </div>
  );
}
