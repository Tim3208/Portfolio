/**
 * 원본: src/widgets/calendar-workspace/ui/constants.ts · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다.
 */
import { AlertCircle, CheckCircle2, Info, LoaderCircle } from "lucide-react";
import type { CategoryId, ScheduleItemTone } from "../../../entities/event/model";
import type { ScheduleDataStatus } from "./types";

/** 일정의 의미 tone을 캘린더 칩 배경·텍스트 조합으로 변환한다. 색상 원천은 entity의 category presentation과 분리돼 있다. */
export const calendarToneClasses = {
  green: {
    chip: "bg-[#1b2a20] text-[#dfffe7]",
  },
  orange: {
    chip: "bg-[#2a2119] text-[#fff1e7]",
  },
  lime: {
    chip: "bg-[#202718] text-[#f1ffd6]",
  },
  blue: {
    chip: "bg-[#18252d] text-[#e3f7ff]",
  },
  amber: {
    chip: "bg-[#2a2418] text-[#fff5d6]",
  },
} satisfies Record<ScheduleItemTone, { chip: string }>;

/** 헤더 제어와 렌더 분기가 공유하는 보기 모드 목록이다. 순서를 바꾸면 토글의 시각 순서도 변경된다. */
export const viewModes = [
  { id: "day", label: "일" },
  { id: "week", label: "주" },
  { id: "month", label: "월" },
] as const;

export const calendarTimeSlots = [
  "06 AM","07 AM","08 AM","09 AM","10 AM","11 AM","12 PM","01 PM","02 PM","03 PM","04 PM","05 PM","06 PM","07 PM","08 PM","09 PM","10 PM",
] as const;

/** 월·주·일 보기에서 반복되는 인터랙션 표면 스타일을 한곳에 둬 focus 대비를 일관되게 유지한다. */
export const calendarSurfaceClasses = {
  focus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87f6b4]/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818]",
  headerButton:
    "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#f3f3f3] transition-colors hover:bg-[#252525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87f6b4]/75",
  quietCard: "border border-[#2b2c2f] bg-[#1f2021]",
  selectedCard: "border-[#87f6b4] bg-[#87f6b4] text-[#151515]",
} as const;

/** 서버 일정 상태의 의미 tone을 notice 스타일로 변환한다. status 종류 추가 시 아이콘 매핑도 함께 갱신해야 한다. */
export const dataStatusToneClasses = {
  loading: {
    wrapper: "border-[#2d4a43] bg-[#192823] text-[#d8fff4]",
    icon: "text-[#27FFBB]",
  },
  error: {
    wrapper: "border-[#5b342f] bg-[#291d1b] text-[#ffd8d1]",
    icon: "text-[#ff9c8b]",
  },
  empty: {
    wrapper: "border-[#3a3a3a] bg-[#202020] text-[#d8d8d8]",
    icon: "text-[#a8a8a8]",
  },
  degraded: {
    wrapper: "border-[#5e4d2c] bg-[#2a2418] text-[#fff0c2]",
    icon: "text-[#fbbf24]",
  },
  live: {
    wrapper: "border-[#2f5d50] bg-[#1b2b26] text-[#d8fff4]",
    icon: "text-[#27FFBB]",
  },
} satisfies Record<
  ScheduleDataStatus["tone"],
  { wrapper: string; icon: string }
>;

/** status notice가 텍스트와 동일한 상태 구분을 제공하도록 tone별 아이콘을 고정한다. */
export const dataStatusIcons = {
  loading: LoaderCircle,
  error: AlertCircle,
  empty: Info,
  degraded: AlertCircle,
  live: CheckCircle2,
} satisfies Record<ScheduleDataStatus["tone"], typeof Info>;

/**
 * 캘린더 칩은 필터 모델을 직접 받지 않으므로 CategoryId의 화면 표시 계약을
 * 이 위젯 경계에서 고정한다.
 */
export const calendarCategoryLabels = {
  event: "이벤트",
  pickup: "픽업",
  update: "업데이트",
  redeem: "리딤코드",
  maintenance: "점검",
} satisfies Record<CategoryId, string>;

export const weekdayLabels = [
  "일","월","화","수","목","금","토",
] as const;
