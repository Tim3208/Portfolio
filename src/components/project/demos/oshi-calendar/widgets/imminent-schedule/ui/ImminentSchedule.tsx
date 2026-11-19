/**
 * 원본: src/widgets/imminent-schedule/ui/ImminentSchedule.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 뷰포트 반응형 분기를 제거하고 원본 데스크톱 값을 고정했다. 상세 페이지 h2 아래 영역·하위 제목을 h3·h4로 낮췄다. 원본 racking-normal 오타를 tracking-normal로 고쳤다. 조립부가 null 상태를 주면 원본 안내 컴포넌트의 슬롯만 생략한다.
 */
import { useId } from "react";
import {
  AlarmClock,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Clock,
  ClockAlert,
} from "lucide-react";
import { IconButton } from "../../../shared/ui";
import { ImminentDataStatus } from "./ImminentDataStatus";
import { ImminentScheduleCard } from "./ImminentScheduleCard";
import type { ImminentScheduleProps } from "./types";
import { formatGroupLabel, groupImminentScheduleItems } from "./utils";

export function ImminentSchedule({
  collapsed,
  items,
  dataStatus,
  onToggleCollapsed,
}: ImminentScheduleProps) {
  const groupedItems = groupImminentScheduleItems(items);
  const contentId = useId();

  return (
    <section
      className={[
        "flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-[#262626] bg-[#181818] px-4 pt-4 transition-[padding] duration-200 motion-reduce:transition-none",
        collapsed ? "px-[14px] w-14" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="임박 일정"
    >
      <header
        className={[
          "flex min-h-[30px] shrink-0 items-center gap-3",
          collapsed ? "justify-center" : "justify-between",
        ].join(" ")}
      >
        <div className={collapsed ? "hidden" : ""}>
          <h3 className="m-0 text-xl font-normal tracking-normal text-[#d6d6d6]">
            임박 일정
          </h3>
        </div>
        <IconButton
          className="shrink-0"
          label={collapsed ? "임박 일정 펼치기" : "임박 일정 접기"}
          onClick={onToggleCollapsed}
          aria-controls={contentId}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ArrowRightFromLine aria-hidden="true" />
          ) : (
            <ArrowLeftFromLine aria-hidden="true" />
          )}
        </IconButton>
      </header>

      <div
        id={contentId}
        className={[
          "dashboard-scrollbar -mr-4 min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-2 pb-[18px]",
          collapsed ? "hidden " : "flex",
        ].join(" ")}
      >
        {dataStatus ? <ImminentDataStatus status={dataStatus} /> : null}
        {groupedItems.length > 0 ? (
          groupedItems.map((group) => {
            const isUrgent = group.daysLeft <= 1;
            const GroupIcon =
              group.daysLeft === 0 ? AlarmClock : isUrgent ? ClockAlert : Clock;
            const headingColor = isUrgent ? "text-[#FF5757]" : "text-[#8CFF57]";

            return (
              <section
                key={group.daysLeft}
                className="min-w-0"
                aria-labelledby={`imminent-group-${group.daysLeft}`}
              >
                <div
                  className={[
                    "mb-2 mt-6 flex min-w-0 items-center gap-2",
                    headingColor,
                  ].join(" ")}
                >
                  <GroupIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <h4
                    id={`imminent-group-${group.daysLeft}`}
                    className="m-0 shrink-0 text-[10px] font-normal tracking-normal"
                  >
                    {formatGroupLabel(group.daysLeft)}
                  </h4>
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  {group.items.map((item) => (
                    <ImminentScheduleCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <p className="m-4 rounded-lg border border-dashed border-[#333333] px-3 py-[18px] text-center text-xs text-[#8d8d8d]">
            선택한 카테고리에 표시할 임박 일정이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
