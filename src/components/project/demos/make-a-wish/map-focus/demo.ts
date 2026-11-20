import { getBoothMarkerIcon } from "./category";
import type { Booth } from "./types";

/**
 * 부스 지도 데모 전용 값. 원본에는 없다.
 *
 * 네이버 지도 SDK 자리에는 OpenStreetMap 표준 타일(배율 19)을 한 장으로 붙인 이미지를 둔다
 * (© OpenStreetMap contributors, 2026-11-20에 받음). 원본이 SDK 투영에서 받던 좌표 변환과
 * 배율 계수는 같은 웹 메르카토르 식으로 대신한다. 평면 좌표는 이미지 왼쪽 위에서 잰 px 이다.
 */
const TILE = 256;
const BASE_ZOOM = 19;
/** 이미지 왼쪽 위 타일의 번호 */
const ORIGIN = { x: 447253, y: 202887 };

export const MAP_IMAGE = {
  src: "/images/projects/make-a-wish/booths/map-osm-z19.png",
  width: 7 * TILE,
  height: 10 * TILE,
} as const;

export const MIN_ZOOM = 17;
export const MAX_ZOOM = 20;
/** 부스가 모여 있는 대운동장 일대(원본 FALLBACK_CENTER · DEFAULT_ZOOM) */
export const INITIAL_VIEW = { ...project(37.642692, 127.106437), zoom: 18 };

/** 위경도를 평면 좌표로. 원본의 projection.fromCoordToPoint 자리다. */
export function project(latitude: number, longitude: number) {
  const world = TILE * 2 ** BASE_ZOOM;
  const radians = (latitude * Math.PI) / 180;
  return {
    x: ((longitude + 180) / 360) * world - ORIGIN.x * TILE,
    y: ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * world - ORIGIN.y * TILE,
  };
}

/** 평면 좌표 1이 화면에서 차지하는 px. 원본의 projection.factor(zoom) 자리다. */
export function factor(zoom: number) {
  return 2 ** (zoom - BASE_ZOOM);
}

/** 이동할 자리를 정하는 기준. container 는 시트를 계산에 넣지 않던 바꾸기 전 방식이다. */
export const BASES = [
  { value: "visible", label: "보이는 영역 가운데" },
  { value: "container", label: "지도 한가운데 · 바꾸기 전" },
] as const;
export type Basis = (typeof BASES)[number]["value"];

const sample = (
  id: number,
  letter: string,
  category: Booth["category"],
  latitude: number,
  longitude: number,
  favoriteCount: number,
  description: string,
): Booth => ({
  id,
  name: `샘플 부스 ${letter}`,
  operator: "샘플 운영 단체",
  description,
  category,
  latitude,
  longitude,
  opensAt: null,
  closesAt: null,
  stampEnabled: false,
  favorited: false,
  favoriteCount,
  // 샘플 부스에는 사진이 없어 분류 아이콘을 카드와 상세의 그림 자리에 쓴다.
  imageUrl: getBoothMarkerIcon(category),
});

/** 이름 · 소개 · 위치 · 북마크 수 모두 지어낸 값이다. 실제 축제의 부스와 자리가 아니다. */
export const SAMPLE_BOOTHS: readonly Booth[] = [
  sample(1, "A", "STUDENT_COUNCIL", 37.642404, 127.106693, 12, "샘플 소개입니다. 학생회가 운영하는 체험 부스 자리입니다."),
  sample(2, "B", "STUDENT_COUNCIL", 37.642542, 127.107444, 7, "샘플 소개입니다. 스탬프 안내를 맡는 부스 자리입니다."),
  sample(3, "C", "CAMPUS", 37.642563, 127.106667, 4, "샘플 소개입니다. 교내 기관이 운영하는 부스 자리입니다."),
  sample(4, "D", "CAMPUS", 37.642106, 127.107686, 0, "샘플 소개입니다. 상담과 안내를 하는 부스 자리입니다."),
  sample(5, "E", "FOOD_TRUCK", 37.641936, 127.107471, 31, "샘플 소개입니다. 간식을 파는 푸드트럭 자리입니다."),
  sample(6, "F", "FOOD_TRUCK", 37.641873, 127.106881, 18, "샘플 소개입니다. 음료를 파는 푸드트럭 자리입니다."),
  sample(7, "G", "GENERAL", 37.642393, 127.107283, 9, "샘플 소개입니다. 동아리가 운영하는 일반 부스 자리입니다."),
  sample(8, "H", "PHOTO_BOOTH", 37.64217, 127.106559, 23, "샘플 소개입니다. 사진을 찍는 포토부스 자리입니다."),
];
