/**
 * 원본: src/widgets/imminent-schedule/ui/constants.ts · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다.
 */
import type { Confidence } from "../../../entities/event/model";
import type { ScheduleDataStatus } from "./types";

/** high는 badge를 숨기므로, 사용자에게 보일 수 있는 신뢰도만 라벨로 유지한다. */
export const confidenceLabels = {
  medium: "신뢰도 보통",
  low: "신뢰도 낮음",
  unknown: "신뢰도 미확인",
} satisfies Partial<Record<Confidence, string>>;

/** 임박 일정의 원격 데이터 상태를 색상·점 조합으로 표현하는 UI 전용 매핑이다. */
export const dataStatusToneClasses = {
  loading: {
    wrapper: "border-[#2d4a43] bg-[#192823] text-[#d8fff4]",
    dot: "bg-[#27FFBB]",
  },
  error: {
    wrapper: "border-[#5b342f] bg-[#291d1b] text-[#ffd8d1]",
    dot: "bg-[#ff9c8b]",
  },
  empty: {
    wrapper: "border-[#343434] bg-[#202020] text-[#d4d4d4]",
    dot: "bg-[#9a9a9a]",
  },
  degraded: {
    wrapper: "border-[#5e4d2c] bg-[#2a2418] text-[#fff0c2]",
    dot: "bg-[#fbbf24]",
  },
  live: {
    wrapper: "border-[#2f5d50] bg-[#1b2b26] text-[#d8fff4]",
    dot: "bg-[#27FFBB]",
  },
} satisfies Record<ScheduleDataStatus["tone"], { wrapper: string; dot: string }>;
