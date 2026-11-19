/**
 * 원본: src/widgets/calendar-workspace/ui/utils.ts · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다.
 */
import { differenceInCalendarDays } from "date-fns";
import type { ScheduleItem } from "../../../entities/event/model";
import {
  formatCalendarDate,
  getCalendarDateKey,
  getCalendarMinutes,
  isSameCalendarDay,
  startOfCalendarDay,
} from "../../../shared/lib/date";
import type {
  DayScheduleLayout,
  DayTimedItemPlacement,
  MonthWeekLayout,
  RangeItemPlacement,
} from "./types";

/** 월간 보기에서 하루 칸을 과도하게 밀어내지 않도록 허용하는 최대 종일 일정 레인 수다. */
export const MONTH_VISIBLE_LANE_COUNT = 2;
/** 일간 시간축의 한 시간당 높이로, 배치 계산과 grid 배경이 반드시 같은 값을 사용해야 한다. */
export const DAY_HOUR_HEIGHT = 64;

export function getGameInitial(item: ScheduleItem) {
  const gameName = item.gameName ?? item.game;
  return gameName.trim().slice(0, 1) || "?";
}

export function formatWeekRange(start: Date, end: Date) {
  if (formatCalendarDate(start, "yyyy") === formatCalendarDate(end, "yyyy")) {
    return `${formatCalendarDate(start, "M월 d일")} - ${formatCalendarDate(end, "M월 d일")}`;
  }

  return `${formatCalendarDate(start, "yyyy년 M월 d일")} - ${formatCalendarDate(end, "yyyy년 M월 d일")}`;
}

export function formatScheduleRange(item: ScheduleItem) {
  if (isSameCalendarDay(item.startAt, item.endAt)) {
    return `${formatCalendarDate(item.startAt, "M월 d일 HH:mm")} - ${formatCalendarDate(item.endAt, "HH:mm")}`;
  }

  if (
    formatCalendarDate(item.startAt, "yyyy") ===
    formatCalendarDate(item.endAt, "yyyy")
  ) {
    return `${formatCalendarDate(item.startAt, "M월 d일")} - ${formatCalendarDate(item.endAt, "M월 d일")}`;
  }

  return `${formatCalendarDate(item.startAt, "yyyy년 M월 d일")} - ${formatCalendarDate(item.endAt, "yyyy년 M월 d일")}`;
}

/**
 * 기간 일정을 현재 주 그리드에 잘라 배치 가능한 column span으로 변환한다.
 * 범위 밖 또는 역전된 일정은 `null`로 제외하고, 양 끝이 잘렸는지는 칩 모양을 위해 함께 반환한다.
 */
export function getRangeItemPlacement(
  item: ScheduleItem,
  rangeStart: Date,
  rangeEnd: Date,
): RangeItemPlacement | null {
  const itemStart = startOfCalendarDay(item.startAt);
  const itemEnd = startOfCalendarDay(item.endAt);
  const normalizedRangeStart = startOfCalendarDay(rangeStart);
  const normalizedRangeEnd = startOfCalendarDay(rangeEnd);

  if (
    itemStart.getTime() > itemEnd.getTime() ||
    itemStart.getTime() > normalizedRangeEnd.getTime() ||
    itemEnd.getTime() < normalizedRangeStart.getTime()
  ) {
    return null;
  }

  const startsBeforeRange = itemStart.getTime() < normalizedRangeStart.getTime();
  const endsAfterRange = itemEnd.getTime() > normalizedRangeEnd.getTime();
  const clampedStart = startsBeforeRange ? normalizedRangeStart : itemStart;
  const clampedEnd = endsAfterRange ? normalizedRangeEnd : itemEnd;
  const startIndex = differenceInCalendarDays(clampedStart, normalizedRangeStart);
  const endIndex = differenceInCalendarDays(clampedEnd, normalizedRangeStart);
  const spanDays = endIndex - startIndex + 1;

  if (spanDays < 1) {
    return null;
  }

  return {
    item,
    gridColumn: `${startIndex + 1} / span ${spanDays}`,
    startsBeforeRange,
    endsAfterRange,
    startIndex,
    spanDays,
  };
}

/** 같은 주의 종일 일정을 시작일·긴 일정·제목 순으로 고정 정렬해 레인 배치가 렌더마다 흔들리지 않게 한다. */
function compareRangePlacements(left: RangeItemPlacement, right: RangeItemPlacement) {
  if (left.startIndex !== right.startIndex) {
    return left.startIndex - right.startIndex;
  }

  if (left.spanDays !== right.spanDays) {
    return right.spanDays - left.spanDays;
  }

  const titleOrder = left.item.title.localeCompare(right.item.title, "ko");
  return titleOrder !== 0 ? titleOrder : left.item.id.localeCompare(right.item.id);
}

/** 월간 한 주의 일정에 최대 3개 레인을 안정적으로 배정한다. */
export function getMonthWeekLayout(
  items: readonly ScheduleItem[],
  weekDays: readonly Date[],
  laneCount = MONTH_VISIBLE_LANE_COUNT,
): MonthWeekLayout {
  const [weekStart] = weekDays;
  const weekEnd = weekDays[weekDays.length - 1];
  const candidates = items
    .map((item) => getRangeItemPlacement(item, weekStart, weekEnd))
    .filter((placement): placement is RangeItemPlacement => Boolean(placement))
    .sort(compareRangePlacements);
  const lanes = Array.from({ length: laneCount }, () => Array(7).fill(false));
  const placements: MonthWeekLayout["placements"][number][] = [];
  const overflowByDate: Record<string, number> = {};

  candidates.forEach((placement) => {
    const lane = lanes.findIndex((occupiedDays) => {
      for (
        let dayIndex = placement.startIndex;
        dayIndex < placement.startIndex + placement.spanDays;
        dayIndex += 1
      ) {
        if (occupiedDays[dayIndex]) {
          return false;
        }
      }

      return true;
    });

    if (lane === -1) {
      for (
        let dayIndex = placement.startIndex;
        dayIndex < placement.startIndex + placement.spanDays;
        dayIndex += 1
      ) {
        const key = getCalendarDateKey(weekDays[dayIndex]);
        overflowByDate[key] = (overflowByDate[key] ?? 0) + 1;
      }
      return;
    }

    for (
      let dayIndex = placement.startIndex;
      dayIndex < placement.startIndex + placement.spanDays;
      dayIndex += 1
    ) {
      lanes[lane][dayIndex] = true;
    }

    placements.push({ ...placement, lane });
  });

  return { placements, overflowByDate };
}

/** 시간축 겹침 계산 전 정렬의 동률 해소 규칙이다. id까지 비교해 같은 입력은 항상 같은 열에 놓인다. */
function compareTimedItems(left: ScheduleItem, right: ScheduleItem) {
  const startDifference = getCalendarMinutes(left.startAt) - getCalendarMinutes(right.startAt);
  if (startDifference !== 0) {
    return startDifference;
  }

  const endDifference = getCalendarMinutes(left.endAt) - getCalendarMinutes(right.endAt);
  return endDifference !== 0 ? endDifference : left.id.localeCompare(right.id);
}

/**
 * 서로 겹치는 시간 일정 묶음에 필요한 최소 열 수를 계산한다.
 * 겹치지 않는 다음 묶음은 즉시 flush해 이전 묶음의 열 수가 뒤 일정의 폭에 영향을 주지 않게 한다.
 */
function assignTimedColumns(items: readonly ScheduleItem[]) {
  const sortedItems = [...items].sort(compareTimedItems);
  const result: DayTimedItemPlacement[] = [];
  let group: ScheduleItem[] = [];
  let groupEnd = -1;

  const flushGroup = () => {
    if (group.length === 0) {
      return;
    }

    const columnEnds: number[] = [];
    const pending = group.map((item) => {
      const startMinute = getCalendarMinutes(item.startAt);
      const endMinute = getCalendarMinutes(item.endAt);
      let columnIndex = columnEnds.findIndex((endMinuteInColumn) => endMinuteInColumn <= startMinute);

      if (columnIndex === -1) {
        columnIndex = columnEnds.length;
        columnEnds.push(endMinute);
      } else {
        columnEnds[columnIndex] = endMinute;
      }

      return { item, startMinute, endMinute, columnIndex };
    });
    const columnCount = columnEnds.length;

    result.push(...pending.map((placement) => ({ ...placement, columnCount })));
    group = [];
    groupEnd = -1;
  };

  sortedItems.forEach((item) => {
    const startMinute = getCalendarMinutes(item.startAt);
    const endMinute = getCalendarMinutes(item.endAt);

    if (group.length > 0 && startMinute >= groupEnd) {
      flushGroup();
    }

    group.push(item);
    groupEnd = Math.max(groupEnd, endMinute);
  });
  flushGroup();

  return result;
}

/** 선택 날짜에 보이는 일정을 장기 일정과 시간축 일정으로 나눈다. */
export function getDayScheduleLayout(
  items: readonly ScheduleItem[],
): DayScheduleLayout {
  const validItems = items.filter((item) => item.endAt.getTime() >= item.startAt.getTime());
  const spanningItems = validItems
    .filter((item) => !isSameCalendarDay(item.startAt, item.endAt))
    .sort((left, right) => left.endAt.getTime() - right.endAt.getTime());
  const timedItems = validItems.filter(
    (item) =>
      isSameCalendarDay(item.startAt, item.endAt) &&
      item.endAt.getTime() > item.startAt.getTime(),
  );

  return {
    spanningItems,
    timedPlacements: assignTimedColumns(timedItems),
  };
}
