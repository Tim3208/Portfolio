/**
 * 원본: src/entities/event/model/categoryPresentation.ts · 기준 커밋: 40c516b.
 * 변경: 원본 타입·표시 계약·순수 로직을 수정 없이 옮겼다.
 */
import type { CategoryId, ScheduleItemTone } from "./types";

export type CategoryPresentation = {
  readonly color: string;
  readonly tone: ScheduleItemTone;
};

/**
 * 카테고리 필터와 일정 화면이 공유하는 표시 계약이다.
 *
 * API 일정의 `tone`은 기존 데이터 호환을 위해 유지하지만, 화면의 핵심 강조색은
 * 이 설정을 `categoryId`로 조회해 사용한다.
 */
export const categoryPresentationById = {
  event: { color: "#8CFF57", tone: "green" },
  pickup: { color: "#FF5757", tone: "orange" },
  update: { color: "#F48317", tone: "amber" },
  redeem: { color: "#22c55e", tone: "lime" },
  maintenance: { color: "#38bdf8", tone: "blue" },
} satisfies Record<CategoryId, CategoryPresentation>;
