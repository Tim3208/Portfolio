/**
 * 원본: eodiya/src/components/CampusMapCP/BuildingCard.tsx
 * 기준 커밋: origin/main 20f029a
 * 변경: 데모 폴더의 타입·Card로 경로를 바꾸고 원본 회색을 범위 변수로 치환.
 */
import type { CampusPlace } from "./types";
import Card from "./Card";

export default function BuildingCard({ place }: { place: CampusPlace }) {
  const locationText = place.floor
    ? `${place.building} ${place.floor}`
    : place.building;

  return (
    <Card>
      <div className="text-lg font-extrabold text-(--eodiya-gray-900)">{place.name}</div>
      <div className="mt-1 text-sm text-(--eodiya-gray-600)">
        {place.building}
        {place.floor ? ` · ${place.floor}` : ""} · {place.category}
      </div>

      {place.category === "건물 내부" ? (
        <>
          <div className="mt-3 text-sm font-semibold text-(--eodiya-gray-800)">
            {locationText}
          </div>
          {place.description ? (
            <div className="mt-1 text-sm text-(--eodiya-gray-700)">
              {place.description}
            </div>
          ) : (
            <div className="mt-1 text-sm text-(--eodiya-gray-500)">
              세부 정보가 아직 없습니다.
            </div>
          )}
        </>
      ) : place.description ? (
        <div className="mt-3 text-sm text-(--eodiya-gray-700)">{place.description}</div>
      ) : (
        <div className="mt-3 text-sm text-(--eodiya-gray-500)">
          설명 정보가 아직 없습니다.
        </div>
      )}
    </Card>
  );
}
