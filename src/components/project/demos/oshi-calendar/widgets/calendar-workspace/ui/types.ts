/**
 * 원본: src/widgets/calendar-workspace/ui/types.ts · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 고정 오늘을 명시적으로 전달하고, 안내 생략을 위한 null 상태를 받는다.
 */
import type { CSSProperties } from "react";
import type { CategoryId, ScheduleItem } from "../../../entities/event/model";
import type { CalendarViewMode } from "../../../shared/lib/date";

export type CalendarWorkspaceProps = {
  readonly today: Date;
  readonly selectedDate: Date;
  readonly viewMode: CalendarViewMode;
  readonly items: ScheduleItem[];
  readonly activeGameCount: number;
  readonly visibleCategoryIds: readonly CategoryId[];
  readonly dataStatus: ScheduleDataStatus | null;
  readonly onSelectedDateChange: (date: Date) => void;
  readonly onViewModeChange: (viewMode: CalendarViewMode) => void;
  readonly onToday: () => void;
  readonly onPreviousPeriod: () => void;
  readonly onNextPeriod: () => void;
};

export type ScheduleDataStatus = {
  readonly tone: "loading" | "error" | "empty" | "degraded" | "live";
  readonly label: string;
  readonly message: string;
};

export type RangeItemPlacement = {
  readonly item: ScheduleItem;
  readonly gridColumn: CSSProperties["gridColumn"];
  readonly startsBeforeRange: boolean;
  readonly endsAfterRange: boolean;
  readonly startIndex: number;
  readonly spanDays: number;
};

export type MonthItemPlacement = RangeItemPlacement & {
  readonly lane: number;
};

export type MonthWeekLayout = {
  readonly placements: readonly MonthItemPlacement[];
  readonly overflowByDate: Readonly<Record<string, number>>;
};

export type DayTimedItemPlacement = {
  readonly item: ScheduleItem;
  readonly startMinute: number;
  readonly endMinute: number;
  readonly columnIndex: number;
  readonly columnCount: number;
};

export type DayScheduleLayout = {
  readonly spanningItems: readonly ScheduleItem[];
  readonly timedPlacements: readonly DayTimedItemPlacement[];
};
