/**
 * 원본: src/widgets/calendar-workspace/ui/ScheduleChip.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 흰색·검정색 팔레트를 루트의 --oshi-* 변수로 격리했다. 캘린더 영역 h3 아래 일정 제목을 h4로 낮췄다.
 */
/* eslint-disable @next/next/no-img-element -- 원본 게임 아바타와 축소 WebP를 그대로 표시한다. */
import type { CSSProperties } from "react";
import {
  categoryPresentationById,
  type ScheduleItem,
} from "../../../entities/event/model";
import { calendarCategoryLabels, calendarToneClasses } from "./constants";
import { formatScheduleRange, getGameInitial } from "./utils";

type ScheduleChipProps = {
  readonly item: ScheduleItem;
  readonly startsBeforeRange?: boolean;
  readonly endsAfterRange?: boolean;
  readonly style?: CSSProperties;
  readonly compact?: boolean;
  readonly className?: string;
};

export function ScheduleChip({
  item,
  startsBeforeRange = false,
  endsAfterRange = false,
  style,
  compact = false,
  className = "",
}: ScheduleChipProps) {
  const toneClasses = calendarToneClasses[item.tone];
  const categoryPresentation = categoryPresentationById[item.categoryId];
  const categoryLabel = calendarCategoryLabels[item.categoryId];

  return (
    <article
      className={[
        "relative flex min-w-0 items-center gap-1.5 overflow-hidden border px-2 shadow-none",
        compact ? "h-6 rounded-[6px]" : "h-8 rounded-[8px]",
        startsBeforeRange ? "rounded-l-[2px]" : "",
        endsAfterRange ? "rounded-r-[2px]" : "",
        toneClasses.chip,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...style, borderColor: `${categoryPresentation.color}59` }}
      aria-label={`${item.title}, ${categoryLabel}, ${formatScheduleRange(item)}`}
    >
      {item.gameImageUrl ? (
        <img
          src={item.gameImageUrl}
          alt=""
          className="h-4 w-4 shrink-0 rounded-[4px] object-cover"
          draggable={false}
        />
      ) : (
        <span
          className={[
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[8px] font-bold text-[color:var(--oshi-black)]/75",
          ].join(" ")}
          style={{ backgroundColor: categoryPresentation.color }}
          aria-hidden="true"
        >
          {getGameInitial(item)}
        </span>
      )}
      <h4 className="min-w-0 truncate text-[10px] font-medium tracking-normal text-current">
        {startsBeforeRange ? "‹ " : ""}
        {item.title}
        {endsAfterRange ? " ›" : ""}
      </h4>
    </article>
  );
}
