/**
 * 원본: src/widgets/calendar-workspace/ui/CalendarDayGrid.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 뷰포트 반응형 분기를 제거하고 원본 데스크톱 값을 고정했다. 흰색·검정색 팔레트를 루트의 --oshi-* 변수로 격리했다.
 */
import type { CSSProperties } from "react";
import type { ScheduleItem } from "../../../entities/event/model";
import { formatCalendarDate } from "../../../shared/lib/date";
import { calendarSurfaceClasses } from "./constants";
import { ScheduleChip } from "./ScheduleChip";
import { DAY_HOUR_HEIGHT, getDayScheduleLayout } from "./utils";

type CalendarDayGridProps = {
  readonly selectedDate: Date;
  readonly items: readonly ScheduleItem[];
  readonly activeGameCount: number;
  readonly visibleCategoryCount: number;
};

/** 24시간 시간축의 행 라벨과 배경 grid를 같은 순서로 만들기 위한 고정 목록이다. */
const hourLabels = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
);

/**
 * 분 단위 배치 정보를 절대 위치 스타일로 바꾼다.
 * `DAY_HOUR_HEIGHT`와 열 폭 계산을 여기로 모아 칩과 시간축 배경의 좌표계가 어긋나지 않게 한다.
 */
function getTimedPlacementStyle(
  startMinute: number,
  endMinute: number,
  columnIndex: number,
  columnCount: number,
): CSSProperties {
  const top = (startMinute / 60) * DAY_HOUR_HEIGHT;
  const height = Math.max(((endMinute - startMinute) / 60) * DAY_HOUR_HEIGHT, 28);
  const columnWidth = 100 / columnCount;

  return {
    position: "absolute",
    top,
    height,
    left: `calc(${columnIndex * columnWidth}% + 2px)`,
    width: `calc(${columnWidth}% - 4px)`,
  };
}

export function CalendarDayGrid({
  selectedDate,
  items,
  activeGameCount,
  visibleCategoryCount,
}: CalendarDayGridProps) {
  const { spanningItems, timedPlacements } = getDayScheduleLayout(items);
  const hasSchedules = spanningItems.length > 0 || timedPlacements.length > 0;
  const emptyMessage =
    activeGameCount === 0
      ? "활성화된 게임이 없습니다."
      : visibleCategoryCount === 0
        ? "표시할 카테고리가 없습니다."
        : `${formatCalendarDate(selectedDate, "M월 d일")}에는 현재 필터와 일치하는 일정이 없습니다.`;

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
      <div className="mb-3 grid shrink-0 grid-cols-[64px_minmax(0,1fr)] gap-3">
        <div
          className={[
            "flex min-h-20 items-center justify-center rounded-[10px] text-center",
            calendarSurfaceClasses.quietCard,
          ].join(" ")}
        >
          <div>
            <span className="block text-[11px] text-[color:var(--oshi-white)]/55">UTC +9</span>
            <strong className="mt-1 block text-[18px] font-medium text-[color:var(--oshi-white)]/90">
              {formatCalendarDate(selectedDate, "d일")}
            </strong>
          </div>
        </div>
        <div
          className={[
            "min-h-20 rounded-[10px] p-2",
            calendarSurfaceClasses.quietCard,
          ].join(" ")}
          aria-label="장기 일정"
        >
          <p className="mb-1.5 text-[10px] font-medium text-[color:var(--oshi-white)]/45">장기 일정</p>
          {spanningItems.length > 0 ? (
            <div className="dashboard-scrollbar grid max-h-[76px] gap-1 overflow-y-auto pr-1 grid-cols-2">
              {spanningItems.map((item) => (
                <ScheduleChip key={item.id} item={item} compact />
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[color:var(--oshi-white)]/38">이 날짜를 지나가는 장기 일정이 없습니다.</p>
          )}
        </div>
      </div>

      <div className="dashboard-scrollbar min-h-0 flex-1 overflow-auto pr-1">
        <div className="grid min-w-[520px] grid-cols-[64px_minmax(0,1fr)] gap-3">
          <div aria-hidden="true">
            {hourLabels.map((label) => (
              <div
                key={label}
                className="flex items-start justify-center pt-1 text-[10px] text-[color:var(--oshi-white)]/45"
                style={{ height: DAY_HOUR_HEIGHT }}
              >
                {label}
              </div>
            ))}
          </div>

          <div
            className="relative overflow-hidden rounded-[10px] border border-[#2b2c2f] bg-[#1f2021]"
            style={{ height: DAY_HOUR_HEIGHT * 24 }}
            aria-label={`${formatCalendarDate(selectedDate, "yyyy년 M월 d일")} 시간별 일정`}
          >
            {hourLabels.map((label) => (
              <div
                key={label}
                className="border-b border-[#303134] last:border-b-0"
                style={{ height: DAY_HOUR_HEIGHT }}
                aria-hidden="true"
              />
            ))}

            {timedPlacements.map((placement) => (
              <ScheduleChip
                key={placement.item.id}
                item={placement.item}
                className="absolute z-10"
                style={getTimedPlacementStyle(
                  placement.startMinute,
                  placement.endMinute,
                  placement.columnIndex,
                  placement.columnCount,
                )}
              />
            ))}

            {!hasSchedules ? (
              <p className="absolute top-8 left-1/2 -translate-x-1/2 text-[12px] text-[color:var(--oshi-white)]/45">
                {emptyMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
