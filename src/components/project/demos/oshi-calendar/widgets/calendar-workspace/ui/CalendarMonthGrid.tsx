/**
 * 원본: src/widgets/calendar-workspace/ui/CalendarMonthGrid.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 뷰포트 반응형 분기를 제거하고 원본 데스크톱 값을 고정했다. 흰색·검정색 팔레트를 루트의 --oshi-* 변수로 격리했다. 고정 오늘을 명시적으로 전달한다.
 */
import {
  formatCalendarDate,
  getCalendarDateKey,
  isCalendarToday,
  isSameCalendarDay,
  isSameCalendarMonth,
} from "../../../shared/lib/date";
import type { CalendarViewMode } from "../../../shared/lib/date";
import type { ScheduleItem } from "../../../entities/event/model";
import {
  calendarSurfaceClasses,
  weekdayLabels,
} from "./constants";
import { ScheduleChip } from "./ScheduleChip";
import { getMonthWeekLayout } from "./utils";

type CalendarMonthGridProps = {
  readonly today: Date;
  readonly monthDays: readonly Date[];
  readonly selectedDate: Date;
  readonly items: readonly ScheduleItem[];
  readonly activeGameCount: number;
  readonly visibleCategoryCount: number;
  readonly onSelectedDateChange: (date: Date) => void;
  readonly onViewModeChange: (viewMode: CalendarViewMode) => void;
};

export function CalendarMonthGrid({
  today: currentTime,
  monthDays,
  selectedDate,
  items,
  activeGameCount,
  visibleCategoryCount,
  onSelectedDateChange,
  onViewModeChange,
}: CalendarMonthGridProps) {
  const weekRows = Array.from(
    { length: Math.ceil(monthDays.length / 7) },
    (_, index) => monthDays.slice(index * 7, index * 7 + 7),
  );
  const emptyMessage =
    activeGameCount === 0
      ? "활성화된 게임이 없습니다."
      : visibleCategoryCount === 0
        ? "표시할 카테고리가 없습니다."
        : "현재 월간 보기에 필터와 일치하는 일정이 없습니다.";

  const openDayView = (day: Date) => {
    onSelectedDateChange(day);
    onViewModeChange("day");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
      <div className="dashboard-scrollbar min-h-0 flex-1 overflow-auto">
        <div
          className="min-h-full min-w-[840px] pb-2"
          role="grid"
          aria-label={`${formatCalendarDate(selectedDate, "yyyy년 M월")} 월간 일정`}
        >
          <div className="grid grid-cols-7 gap-x-2.5 pb-2" role="row">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="py-2 text-center text-[11px] font-medium text-[color:var(--oshi-white)]/58"
                role="columnheader"
              >
                {label}
              </div>
            ))}
          </div>

          {weekRows.map((weekDays) => {
            const layout = getMonthWeekLayout(items, weekDays);
            const weekKey = getCalendarDateKey(weekDays[0]);

            return (
              <div
                key={weekKey}
                className="relative mb-2.5 min-h-[144px] last:mb-0"
                role="row"
              >
                <div className="absolute inset-0 grid grid-cols-7 gap-x-2.5">
                  {weekDays.map((day) => {
                    const selected = isSameCalendarDay(day, selectedDate);
                    const today = isCalendarToday(day, currentTime);
                    const dimmed = !isSameCalendarMonth(day, selectedDate);
                    const dateKey = getCalendarDateKey(day);
                    const overflowCount = layout.overflowByDate[dateKey] ?? 0;

                    return (
                      <div
                        key={dateKey}
                        className={[
                          "relative min-w-0 rounded-[10px] border px-2 py-2",
                          selected
                            ? calendarSurfaceClasses.selectedCard
                            : calendarSurfaceClasses.quietCard,
                        ].join(" ")}
                        role="gridcell"
                      >
                        <button
                          type="button"
                          className={[
                            "inline-flex h-7 w-full cursor-pointer items-center justify-center rounded-full text-[18px] font-medium transition-colors hover:bg-[color:var(--oshi-white)]/8",
                            selected
                              ? "text-[#151515]"
                              : today
                                ? "border-[#87f6b4]/65 text-[#eafff2]"
                                : dimmed
                                  ? "border border-transparent text-[color:var(--oshi-white)]/35"
                                  : "border border-transparent text-[color:var(--oshi-white)]/80",
                            calendarSurfaceClasses.focus,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => onSelectedDateChange(day)}
                          aria-pressed={selected}
                          aria-current={today ? "date" : undefined}
                          aria-label={formatCalendarDate(day, "yyyy년 M월 d일 EEEE")}
                        >
                          {formatCalendarDate(day, "d")}
                        </button>

                        {overflowCount > 0 ? (
                          <button
                            type="button"
                            className={[
                              "absolute right-2 bottom-2 cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium hover:bg-[#87f6b4]/10",
                              selected ? "text-[#101312]" : "text-[#b8ffd2]",
                              calendarSurfaceClasses.focus,
                            ].join(" ")}
                            onClick={() => openDayView(day)}
                            aria-label={`${formatCalendarDate(day, "M월 d일")} 숨은 일정 ${overflowCount}개를 일간 보기로 열기`}
                          >
                            +{overflowCount}개
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="pointer-events-none absolute inset-x-0 top-11 grid grid-cols-7 grid-rows-2 gap-x-2.5 gap-y-1">
                  {layout.placements.map((placement) => (
                    <ScheduleChip
                      key={`${weekKey}-${placement.item.id}`}
                      item={placement.item}
                      startsBeforeRange={placement.startsBeforeRange}
                      endsAfterRange={placement.endsAfterRange}
                      compact
                      className="pointer-events-auto mx-2"
                      style={{
                        gridColumn: placement.gridColumn,
                        gridRow: placement.lane + 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {items.length === 0 ? <p className="sr-only">{emptyMessage}</p> : null}
      </div>
    </div>
  );
}
