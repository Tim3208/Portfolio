/**
 * 원본: src/shared/lib/date/schedule.ts · 기준 커밋: 40c516b.
 * 변경: isCalendarToday의 실제 시각 기본값을 없애 오늘을 반드시 받게 했다.
 */
import { TZDate } from "@date-fns/tz";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

/** 서버·브라우저 실행 위치와 무관하게 달력 경계와 D-day를 해석할 서비스 기준 시간대다. */
export const CALENDAR_TIME_ZONE = "Asia/Seoul";
export const dayLabels = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 주간·월간 grid가 같은 일요일 시작 규칙을 사용하도록 date-fns 옵션을 공유한다. */
const sundayStartWeekOptions = { weekStartsOn: 0 as const };

export type CalendarViewMode = "month" | "week" | "day";

export type LocalCalendarDateRange = {
  start: Date;
  end: Date;
};

export type ScheduleDateRangeItem = {
  startAt: Date;
  endAt: Date;
  categoryId?: string;
};

type SchedulableItem = {
  categoryId: string;
  endAt: Date;
};

/** 절대 시각을 서비스 기준 시간대의 Date 호환 객체로 바꾼다. */
export function toCalendarTimeZone(date: Date) {
  return new TZDate(date.getTime(), CALENDAR_TIME_ZONE);
}

/** 캘린더 전역에서 동일한 한국 시간 포맷을 사용하게 한다. */
export function formatCalendarDate(date: Date, pattern: string) {
  return format(toCalendarTimeZone(date), pattern);
}

/** 한국 날짜 경계를 비교하거나 map key로 사용할 안정적인 값을 만든다. */
export function getCalendarDateKey(date: Date) {
  return formatCalendarDate(date, "yyyy-MM-dd");
}

export function getCalendarDayOfWeek(date: Date) {
  return toCalendarTimeZone(date).getDay();
}

export function getCalendarMinutes(date: Date) {
  const zonedDate = toCalendarTimeZone(date);
  return zonedDate.getHours() * 60 + zonedDate.getMinutes();
}

export function isSameCalendarDay(left: Date, right: Date) {
  return getCalendarDateKey(left) === getCalendarDateKey(right);
}

export function isSameCalendarMonth(left: Date, right: Date) {
  return formatCalendarDate(left, "yyyy-MM") === formatCalendarDate(right, "yyyy-MM");
}

export function isCalendarToday(date: Date, now: Date) {
  return isSameCalendarDay(date, now);
}

export function startOfCalendarDay(date: Date) {
  return startOfDay(toCalendarTimeZone(date));
}

/** 현재 보기 단위로 날짜를 이동하며 브라우저 시간대에 영향을 받지 않는다. */
export function shiftCalendarDate(
  date: Date,
  viewMode: CalendarViewMode,
  amount: number,
) {
  const zonedDate = toCalendarTimeZone(date);

  if (viewMode === "month") {
    return addMonths(zonedDate, amount);
  }

  if (viewMode === "week") {
    return addWeeks(zonedDate, amount);
  }

  return addDays(zonedDate, amount);
}

/** 선택 날짜를 포함하는 일요일~토요일 범위를 반환한다. */
export function getWeekCalendarDays(selectedDate: Date) {
  const zonedDate = toCalendarTimeZone(selectedDate);

  return eachDayOfInterval({
    start: startOfWeek(zonedDate, sundayStartWeekOptions),
    end: endOfWeek(zonedDate, sundayStartWeekOptions),
  });
}

/** 주간 칸 배열의 첫날·마지막 날을 데이터 필터에도 그대로 쓰기 위한 날짜 범위로 축약한다. */
export function getWeekDateRange(selectedDate: Date): LocalCalendarDateRange {
  const weekDays = getWeekCalendarDays(selectedDate);

  return {
    start: weekDays[0],
    end: weekDays[weekDays.length - 1],
  };
}

/** 월간 그리드에 노출되는 앞뒤 달 날짜까지 포함한다. */
export function getMonthCalendarDays(selectedDate: Date) {
  const zonedDate = toCalendarTimeZone(selectedDate);
  const monthStart = startOfMonth(zonedDate);
  const monthEnd = endOfMonth(zonedDate);

  return eachDayOfInterval({
    start: startOfWeek(monthStart, sundayStartWeekOptions),
    end: endOfWeek(monthEnd, sundayStartWeekOptions),
  });
}

/** 화면과 데이터 상태가 같은 기간을 사용하도록 보기별 범위를 한곳에서 결정한다. */
export function getCalendarViewDateRange(
  selectedDate: Date,
  viewMode: CalendarViewMode,
): LocalCalendarDateRange {
  if (viewMode === "month") {
    const monthDays = getMonthCalendarDays(selectedDate);
    return { start: monthDays[0], end: monthDays[monthDays.length - 1] };
  }

  if (viewMode === "week") {
    return getWeekDateRange(selectedDate);
  }

  const day = startOfCalendarDay(selectedDate);
  return { start: day, end: day };
}

/** 두 날짜 범위가 한국 달력 날짜 기준으로 겹치는지 확인한다. */
export function doesLocalCalendarDayRangeOverlap(
  firstRange: LocalCalendarDateRange,
  secondRange: LocalCalendarDateRange,
) {
  const firstStartTime = startOfCalendarDay(firstRange.start).getTime();
  const firstEndTime = startOfCalendarDay(firstRange.end).getTime();
  const secondStartTime = startOfCalendarDay(secondRange.start).getTime();
  const secondEndTime = startOfCalendarDay(secondRange.end).getTime();

  if (firstStartTime > firstEndTime || secondStartTime > secondEndTime) {
    return false;
  }

  return firstStartTime <= secondEndTime && secondStartTime <= firstEndTime;
}

/**
 * event entity를 직접 import하지 않는 generic 카테고리 필터다.
 * categoryId가 없는 항목은 개인 일정 등 확장 데이터가 기본적으로 숨지 않도록 항상 통과시킨다.
 */
export function filterScheduleItemsByCategory<
  TItem extends Pick<ScheduleDateRangeItem, "categoryId">,
>(items: TItem[], visibleCategoryIds: readonly string[]) {
  return items.filter((item) => {
    if (item.categoryId === undefined) {
      return true;
    }

    return visibleCategoryIds.includes(item.categoryId);
  });
}

/**
 * 시간대가 아닌 서비스 달력 날짜 단위로 겹치는 항목만 남긴다.
 * `startAt`·`endAt` 구조만 요구해 widget과 entity가 같은 기간 규칙을 재사용할 수 있다.
 */
export function filterScheduleItemsByVisibleDateRange<
  TItem extends ScheduleDateRangeItem,
>(items: TItem[], visibleDateRange: LocalCalendarDateRange) {
  return items.filter((item) =>
    doesLocalCalendarDayRangeOverlap(
      { start: item.startAt, end: item.endAt },
      visibleDateRange,
    ),
  );
}

/** 시간 차이가 아닌 한국 달력 날짜 기준 D-day를 계산한다. */
export function getDaysLeft(endAt: Date, fromDate: Date) {
  return differenceInCalendarDays(
    startOfCalendarDay(endAt),
    startOfCalendarDay(fromDate),
  );
}

/**
 * 카테고리 필터를 적용한 뒤 종료 시각까지 남은 실제 밀리초와 한국 날짜 기준 D-day를 함께 계산한다.
 * 이미 끝난 일정은 제외하고 가까운 종료 순으로 정렬해 임박 위젯의 그룹화 입력 계약을 만든다.
 */
export function getImminentScheduleItems<TItem extends SchedulableItem>(
  items: TItem[],
  visibleCategoryIds: string[],
  fromDate: Date,
): Array<TItem & { daysLeft: number; remainingMs: number }> {
  return items
    .filter((item) => visibleCategoryIds.includes(item.categoryId))
    .map((item) => ({
      ...item,
      daysLeft: getDaysLeft(item.endAt, fromDate),
      remainingMs: item.endAt.getTime() - fromDate.getTime(),
    }))
    .filter((item) => item.remainingMs > 0)
    .sort((left, right) => left.remainingMs - right.remainingMs);
}
