import type { BoothSheetSnap } from "./types";

/**
 * 부스 지도 이동 도식의 샘플 배치. 원본에는 없는 데모 전용 값이다.
 *
 * 실제 지도 SDK 대신 평면 하나를 쓴다. 좌표는 배율 19에서 1 = 1px 인 평면 좌표이고,
 * 원본이 SDK 투영에서 받던 배율 계수는 2의 거듭제곱으로 대신한다. 부스 이름과 위치는
 * 실제 축제의 부스 · 좌표가 아니다.
 */
export const MAP_BOOTHS = [
  { id: 1, name: "샘플 부스 A", x: -200, y: -150 },
  { id: 2, name: "샘플 부스 B", x: -60, y: -40 },
  { id: 3, name: "샘플 부스 C", x: 90, y: -140 },
  { id: 4, name: "샘플 부스 D", x: 210, y: 20 },
  { id: 5, name: "샘플 부스 E", x: -150, y: 120 },
  { id: 6, name: "샘플 부스 F", x: 60, y: 160 },
] as const;

export const MIN_ZOOM = 16;
export const MAX_ZOOM = 20;
export const INITIAL_CAMERA = { x: 0, y: 0, zoom: 18 };

/** 평면 좌표 1이 화면에서 차지하는 px. 원본의 projection.factor(zoom) 자리다. */
export function factor(zoom: number) {
  return 2 ** (zoom - 19);
}

/** 이동할 자리를 정하는 기준. container 는 시트를 계산에 넣지 않던 바꾸기 전 방식이다. */
export const BASES = [
  { value: "visible", label: "보이는 영역 가운데" },
  { value: "container", label: "지도 한가운데 · 바꾸기 전" },
] as const;
export type Basis = (typeof BASES)[number]["value"];

export const SNAPS = [
  { value: "expanded", label: "펼침" },
  { value: "half", label: "절반" },
  { value: "collapsed", label: "접힘" },
] as const satisfies readonly { value: BoothSheetSnap; label: string }[];

/** 도식의 평면에 깔아 두는 눈금과 덩어리. 움직임을 읽기 위한 기준일 뿐 실제 지형이 아니다. */
export const PLANE = {
  size: 1600,
  grid: 80,
  blocks: [
    { x: -330, y: -250, width: 190, height: 130 },
    { x: -20, y: -260, width: 250, height: 90 },
    { x: 110, y: -70, width: 210, height: 150 },
    { x: -260, y: 60, width: 220, height: 170 },
    { x: 0, y: 130, width: 170, height: 120 },
  ],
} as const;
