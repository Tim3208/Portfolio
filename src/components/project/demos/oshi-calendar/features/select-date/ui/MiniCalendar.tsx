/**
 * 원본: src/features/select-date/ui/MiniCalendar.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 흰색·검정색 팔레트를 루트의 --oshi-* 변수로 격리했다. 원본 h1을 p로 바꿨다. 전달된 고정 오늘로 aria-current를 표시한다.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  dayLabels,
  formatCalendarDate,
  getMonthCalendarDays,
  isSameCalendarDay,
  isCalendarToday,
  isSameCalendarMonth,
  shiftCalendarDate,
} from "../../../shared/lib/date";
import { IconButton, Panel } from "../../../shared/ui";

type MiniCalendarProps = {
  today: Date;
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
};

/**
 * 좌측 상단의 작은 월간 날짜 선택기다.
 *
 * 실제 일정 데이터는 모르고, 선택 날짜 변경 이벤트만 상위 페이지에 전달한다.
 */
export function MiniCalendar({
  today,
  selectedDate,
  onSelectedDateChange,
}: MiniCalendarProps) {
  const monthDays = getMonthCalendarDays(selectedDate);

  return (
    <Panel className="p-4" aria-label="날짜 선택">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[15px] font-medium tracking-normal">
          <span className="text-[#d6d6d6]/70">
            {formatCalendarDate(selectedDate, "yyyy년 ")}
          </span>
          <span className="text-[#d6d6d6]">
            {formatCalendarDate(selectedDate, "M")}
          </span>
          <span className="text-[#d6d6d6]/70">월</span>
        </p>
        <div className="inline-flex items-center gap-1" aria-label="월 이동">
          <IconButton
            label="이전 달"
            onClick={() =>
              onSelectedDateChange(shiftCalendarDate(selectedDate, "month", -1))
            }
          >
            <ChevronLeft strokeWidth={2} aria-hidden="true" />
          </IconButton>
          <IconButton
            label="다음 달"
            onClick={() =>
              onSelectedDateChange(shiftCalendarDate(selectedDate, "month", 1))
            }
          >
            <ChevronRight strokeWidth={2} aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <div
        className="mt-4 grid grid-cols-7 items-center justify-items-center text-[11px] text-[#8d8d8d]"
        aria-hidden="true"
      >
        {dayLabels.map((day) => (
          <span key={day} className="text-[11px] font-medium text-[color:var(--oshi-white)]/58">
            {day}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 items-center justify-items-center gap-y-1.5">
        {monthDays.map((day) => {
          const selected = isSameCalendarDay(day, selectedDate);
          const dimmed = !isSameCalendarMonth(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={[
                "h-7 w-7 cursor-pointer rounded-full border border-transparent text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24e6b0]/70",
                selected
                  ? "border-[#27FFBB] bg-[#27FFBB] text-[color:var(--oshi-black)]/75 opacity-100 hover:bg-[#27FFBB] hover:text-[color:var(--oshi-black)]/75 focus-visible:bg-[#27FFBB] focus-visible:text-[color:var(--oshi-black)]/75"
                  : "bg-transparent text-[color:var(--oshi-white)]/70 hover:bg-[#303030] hover:text-[color:var(--oshi-white)] focus-visible:bg-[#303030] focus-visible:text-[color:var(--oshi-white)]",
                dimmed && !selected ? "text-[color:var(--oshi-white)]/40" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectedDateChange(day)}
              aria-pressed={selected}
              aria-current={isCalendarToday(day, today) ? "date" : undefined}
              aria-label={formatCalendarDate(day, "yyyy년 M월 d일")}
            >
              {formatCalendarDate(day, "d")}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
