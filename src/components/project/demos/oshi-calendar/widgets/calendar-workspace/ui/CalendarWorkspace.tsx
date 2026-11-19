/**
 * 원본: src/widgets/calendar-workspace/ui/CalendarWorkspace.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 뷰포트 반응형 분기를 제거하고 원본 데스크톱 값을 고정했다. 고정 오늘을 명시적으로 전달한다. 조립부가 null 상태를 주면 안내 슬롯을 생략하며 원본 안내 컴포넌트는 유지한다.
 */
import {
  filterScheduleItemsByVisibleDateRange,
  getCalendarViewDateRange,
  getMonthCalendarDays,
  getWeekCalendarDays,
} from "../../../shared/lib/date";
import { CalendarDayGrid } from "./CalendarDayGrid";
import { CalendarMonthGrid } from "./CalendarMonthGrid";
import { CalendarWeekGrid } from "./CalendarWeekGrid";
import { CalendarWorkspaceHeader } from "./CalendarWorkspaceHeader";
import { ScheduleDataNotice } from "./ScheduleDataNotice";
import type { CalendarWorkspaceProps, RangeItemPlacement } from "./types";
import { formatWeekRange, getRangeItemPlacement } from "./utils";

export function CalendarWorkspace({
  today,
  selectedDate,
  viewMode,
  items,
  activeGameCount,
  visibleCategoryIds,
  dataStatus,
  onSelectedDateChange,
  onViewModeChange,
  onToday,
  onPreviousPeriod,
  onNextPeriod,
}: CalendarWorkspaceProps) {
  /** 화면 렌더·빈 상태·상태 notice가 같은 기간을 판단하도록 보기별 날짜 범위를 먼저 고정한다. */
  const visibleDateRange = getCalendarViewDateRange(selectedDate, viewMode);
  const visibleItems = filterScheduleItemsByVisibleDateRange(
    items,
    visibleDateRange,
  );
  const visibleCategoryCount = visibleCategoryIds.length;

  /**
   * 세 보기의 입력을 하나의 필터된 일정 목록에서 만들되, 주간 보기만 기간 일정의 span 배치가 필요하다.
   * 주간 placement 정렬은 겹친 일정의 수직 순서를 안정화하는 UI 계약이다.
   */
  const renderView = () => {
    if (viewMode === "month") {
      return (
        <CalendarMonthGrid
          today={today}
          monthDays={getMonthCalendarDays(selectedDate)}
          selectedDate={selectedDate}
          items={visibleItems}
          activeGameCount={activeGameCount}
          visibleCategoryCount={visibleCategoryCount}
          onSelectedDateChange={onSelectedDateChange}
          onViewModeChange={onViewModeChange}
        />
      );
    }

    if (viewMode === "day") {
      return (
        <CalendarDayGrid
          selectedDate={selectedDate}
          items={visibleItems}
          activeGameCount={activeGameCount}
          visibleCategoryCount={visibleCategoryCount}
        />
      );
    }

    const weekDays = getWeekCalendarDays(selectedDate);
    const weekStart = visibleDateRange.start;
    const weekEnd = visibleDateRange.end;
    const placements = visibleItems
      .map((item) => getRangeItemPlacement(item, weekStart, weekEnd))
      .filter((placement): placement is RangeItemPlacement => Boolean(placement))
      .sort((left, right) => {
        if (left.startIndex !== right.startIndex) {
          return left.startIndex - right.startIndex;
        }

        return right.spanDays - left.spanDays;
      });
    const showEmptyState =
      activeGameCount === 0 ||
      visibleCategoryCount === 0 ||
      placements.length === 0;

    return (
      <CalendarWeekGrid
        today={today}
        weekDays={weekDays}
        selectedDate={selectedDate}
        activeGameCount={activeGameCount}
        visibleCategoryCount={visibleCategoryCount}
        weekLabel={formatWeekRange(weekStart, weekEnd)}
        placements={placements}
        showEmptyState={showEmptyState}
        onSelectedDateChange={onSelectedDateChange}
      />
    );
  };

  return (
    <section
      className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#181818] text-[#e7e7e7]"
      aria-label="캘린더 작업 영역"
    >
      <CalendarWorkspaceHeader
        selectedDate={selectedDate}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onToday={onToday}
        onPreviousPeriod={onPreviousPeriod}
        onNextPeriod={onNextPeriod}
      />
      {dataStatus ? (
        <div className="px-5 pb-3">
          <ScheduleDataNotice status={dataStatus} />
        </div>
      ) : null}
      {renderView()}
    </section>
  );
}
