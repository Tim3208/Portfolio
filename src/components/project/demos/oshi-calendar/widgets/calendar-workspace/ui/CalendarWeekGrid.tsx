/**
 * 원본: src/widgets/calendar-workspace/ui/CalendarWeekGrid.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 뷰포트 반응형 분기를 제거하고 원본 데스크톱 값을 고정했다. 고정 오늘을 명시적으로 전달한다.
 */
import {
  formatCalendarDate,
  getCalendarDayOfWeek,
  isCalendarToday,
  isSameCalendarDay,
} from "../../../shared/lib/date";
import {
  calendarSurfaceClasses,
  calendarTimeSlots,
  weekdayLabels,
} from "./constants";
import { ScheduleChip } from "./ScheduleChip";
import type { RangeItemPlacement } from "./types";

type CalendarWeekGridProps = {
  readonly today: Date;
  readonly weekDays: readonly Date[];
  readonly selectedDate: Date;
  readonly activeGameCount: number;
  readonly visibleCategoryCount: number;
  readonly weekLabel: string;
  readonly placements: readonly RangeItemPlacement[];
  readonly showEmptyState: boolean;
  readonly onSelectedDateChange: (date: Date) => void;
};

export function CalendarWeekGrid({
  today: currentTime,
  weekDays,
  selectedDate,
  activeGameCount,
  visibleCategoryCount,
  weekLabel,
  placements,
  showEmptyState,
  onSelectedDateChange,
}: CalendarWeekGridProps) {
  const gridColumns = "grid-cols-[60px_repeat(7,minmax(154px,1fr))]";
  const hasAllDaySchedules = !showEmptyState && placements.length > 0;
  const emptyStateMessage =
    activeGameCount === 0
      ? "활성화된 게임이 없습니다."
      : visibleCategoryCount === 0
        ? "표시할 카테고리가 없습니다."
        : `${weekLabel}에는 현재 필터와 일치하는 일정이 없습니다.`;

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
      <div className="dashboard-scrollbar min-h-0 flex-1 overflow-auto pr-1">
        <div className="min-h-full min-w-[1280px] pb-2">
          <div className={["grid gap-x-3", gridColumns].join(" ")}>
            <div
              className={[
                "flex h-[124px] items-center justify-center rounded-[10px]",
                calendarSurfaceClasses.quietCard,
              ].join(" ")}
              aria-hidden="true"
            >
              <span className="rotate-180 text-[18px] leading-none font-medium tracking-normal text-[#f5f5f5] [writing-mode:vertical-rl]">
                UTC +9
              </span>
            </div>
            {weekDays.map((day) => {
              const selected = isSameCalendarDay(day, selectedDate);
              const today = isCalendarToday(day, currentTime);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={[
                    "flex h-[124px] min-w-0 cursor-pointer flex-col items-center justify-center rounded-[10px] border px-2 text-center transition-colors hover:bg-[#252627]",
                    selected
                      ? calendarSurfaceClasses.selectedCard
                      : calendarSurfaceClasses.quietCard,
                    today && !selected ? "border-[#87f6b4]/65 text-[#eafff2]" : "",
                    calendarSurfaceClasses.focus,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectedDateChange(day)}
                  aria-pressed={selected}
                  aria-current={today ? "date" : undefined}
                  aria-label={`${formatCalendarDate(day, "yyyy년 M월 d일")} ${weekdayLabels[getCalendarDayOfWeek(day)]}`}
                >
                  <span
                    className={[
                      "text-[22px] leading-none font-medium tracking-normal",
                      selected ? "text-[#101312]" : "text-[#f6f6f6]",
                    ].join(" ")}
                  >
                    {weekdayLabels[getCalendarDayOfWeek(day)]}
                  </span>
                  <span
                    className={[
                      "mt-4 text-[40px] leading-none font-medium tracking-normal",
                      selected ? "text-[#101312]" : "text-[#f6f6f6]",
                    ].join(" ")}
                  >
                    {formatCalendarDate(day, "d")}
                  </span>
                </button>
              );
            })}
          </div>

          {hasAllDaySchedules ? (
            <div className={["mt-3 grid gap-x-3", gridColumns].join(" ")}>
              <div aria-hidden="true" />
              <div className="dashboard-scrollbar col-span-7 max-h-[72px] overflow-y-auto pr-1">
                <div className="grid grid-cols-7 gap-y-1.5">
                  {placements.map((placement) => (
                    <ScheduleChip
                      key={placement.item.id}
                      item={placement.item}
                      startsBeforeRange={placement.startsBeforeRange}
                      endsAfterRange={placement.endsAfterRange}
                      style={{ gridColumn: placement.gridColumn }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="sr-only">{emptyStateMessage}</p>
          )}

          <div className={["mt-3 grid gap-x-3 gap-y-2.5", gridColumns].join(" ")}>
            {calendarTimeSlots.map((timeLabel) => (
              <div key={timeLabel} className="contents">
                <div className="flex h-[108px] items-start justify-center pt-5 text-[12px] leading-none font-medium text-[#f5f5f5]">
                  {timeLabel}
                </div>
                {weekDays.map((day) => (
                  <div
                    key={`${timeLabel}-${day.toISOString()}`}
                    className={[
                      "h-[108px] rounded-[10px]",
                      calendarSurfaceClasses.quietCard,
                    ].join(" ")}
                    aria-hidden="true"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
