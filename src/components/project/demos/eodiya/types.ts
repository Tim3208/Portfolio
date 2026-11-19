/**
 * 원본: eodiya origin/main src/lib/types.ts · 기준 커밋 20f029a.
 * 변경점: 원본 타입을 그대로 옮기고 출처 주석만 더했다.
 */
export type PlaceCategory = "건물" | "건물 내부";

export type CampusPlace = {
  id: string;
  name: string;
  building: string;
  floor?: string;
  category: PlaceCategory;
  aliases: string[];
  description?: string;
  point: {
    lat: number;
    lng: number;
  };
};
