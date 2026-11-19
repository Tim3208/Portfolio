/**
 * 원본: src/widgets/calendar-workspace/ui/CalendarWorkspaceHeader.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 뷰포트 반응형 분기를 제거하고 원본 데스크톱 값을 고정했다. 흰색·검정색 팔레트를 루트의 --oshi-* 변수로 격리했다. 상세 페이지 h2 아래 영역·하위 제목을 h3·h4로 낮췄다.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarViewMode } from "../../../shared/lib/date";
import { formatCalendarDate } from "../../../shared/lib/date";
import { calendarSurfaceClasses, viewModes } from "./constants";

type CalendarWorkspaceHeaderProps = {
  readonly selectedDate: Date;
  readonly viewMode: CalendarViewMode;
  readonly onViewModeChange: (viewMode: CalendarViewMode) => void;
  readonly onToday: () => void;
  readonly onPreviousPeriod: () => void;
  readonly onNextPeriod: () => void;
};

/** 이전·다음 버튼의 접근성 레이블이 현재 이동 단위를 정확히 설명하도록 하는 보기별 명칭이다. */
const viewModeLabels: Record<CalendarViewMode, string> = {
  month: "월",
  week: "주",
  day: "일",
};

/** 일간 보기만 요일까지 표시해 선택 날짜의 문맥을 유지하고, 나머지 보기는 월 단위 제목으로 압축한다. */
function formatHeaderTitle(date: Date, viewMode: CalendarViewMode) {
  return viewMode === "day"
    ? formatCalendarDate(date, "yyyy년 M월 d일 EEEE")
    : formatCalendarDate(date, "yyyy년 M월");
}

export function CalendarWorkspaceHeader({
  selectedDate,
  viewMode,
  onViewModeChange,
  onToday,
  onPreviousPeriod,
  onNextPeriod,
}: CalendarWorkspaceHeaderProps) {
  const periodLabel = viewModeLabels[viewMode];

  return (
    <header className="relative flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
      <div className="flex min-w-0 items-center gap-5">
        <h3 className="m-0 shrink-0 text-[18px] leading-none font-medium tracking-normal text-[#bdbdbd]">
          {formatHeaderTitle(selectedDate, viewMode)}
        </h3>
        <button
          type="button"
          className={[
            "inline-flex h-7 cursor-pointer items-center justify-center rounded-full bg-[#2b2b2b] px-2.5 text-[11px] font-medium text-[#f1f1f1] transition-colors hover:bg-[#343434]",
            calendarSurfaceClasses.focus,
          ].join(" ")}
          onClick={onToday}
        >
          오늘
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={calendarSurfaceClasses.headerButton}
            onClick={onPreviousPeriod}
            aria-label={`이전 ${periodLabel}`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={calendarSurfaceClasses.headerButton}
            onClick={onNextPeriod}
            aria-label={`다음 ${periodLabel}`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="inline-grid h-8 grid-cols-3 overflow-hidden rounded-[10px] border border-[#292929] bg-[#242424] p-0.5"
        role="group"
        aria-label="캘린더 보기"
      >
        {viewModes.map((mode) => {
          const active = mode.id === viewMode;

          return (
            <button
              key={mode.id}
              type="button"
              className={[
                "min-w-[92px] cursor-pointer rounded-[6px] px-3 text-[11px] font-medium transition-colors ",
                active
                  ? "bg-[#87f6b4] text-[#101312]"
                  : "text-[#ececec] hover:bg-[color:var(--oshi-white)]/5",
                calendarSurfaceClasses.focus,
              ].join(" ")}
              aria-pressed={active}
              onClick={() => onViewModeChange(mode.id)}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
