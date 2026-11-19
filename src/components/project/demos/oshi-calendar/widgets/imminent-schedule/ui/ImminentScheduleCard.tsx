/**
 * 원본: src/widgets/imminent-schedule/ui/ImminentScheduleCard.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 뷰포트 반응형 분기를 제거하고 원본 데스크톱 값을 고정했다. 흰색·검정색 팔레트를 루트의 --oshi-* 변수로 격리했다. 그룹 h4 아래 카드 제목을 h5로 낮췄다.
 */
/* eslint-disable @next/next/no-img-element -- 원본 게임 아바타와 축소 WebP를 그대로 표시한다. */
import { ChevronDown, Gift } from "lucide-react";
import {
  categoryPresentationById,
  type ImminentScheduleItem,
} from "../../../entities/event/model";
import { formatCalendarDate } from "../../../shared/lib/date";
import {
  formatRewardAmount,
  formatRewardValuationAmount,
  formatTimeLeft,
  getGameInitial,
  getScheduleBadges,
} from "./utils";

export function ImminentScheduleCard({
  item,
}: {
  readonly item: ImminentScheduleItem;
}) {
  const badges = getScheduleBadges(item);
  const categoryPresentation = categoryPresentationById[item.categoryId];
  const gameName = item.gameName ?? item.game;
  const rewards = item.categoryId === "event" ? (item.rewards ?? []) : [];
  const rewardValuation = item.rewardValuation;

  return (
    <article className="relative min-w-0 overflow-hidden rounded-xl border border-[#292929] bg-[#202020] p-3 pl-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/2%)]">
      <span
        className={[
          "absolute top-0 bottom-0 left-0 w-[3px]",
        ].join(" ")}
        style={{ backgroundColor: categoryPresentation.color }}
        aria-hidden="true"
      />
      <div className="flex min-w-0 items-center gap-2">
        {item.gameImageUrl ? (
          <img
            src={item.gameImageUrl}
            alt=""
            className="h-4 w-4 shrink-0 rounded-[3px] object-cover"
          />
        ) : (
          <span
            className={[
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] text-xs font-bold text-[#1f1f1f]",
            ].join(" ")}
            style={{ backgroundColor: categoryPresentation.color }}
            aria-hidden="true"
          >
            {getGameInitial(item)}
          </span>
        )}
        <span className="min-w-0 truncate text-[8px] font-normal text-[color:var(--oshi-white)]">
          {gameName}
        </span>
      </div>

      <h5 className="my-1.5 break-keep break-words text-[12px] leading-snug font-normal tracking-normal text-[color:var(--oshi-white)]">
        {item.title}
      </h5>

      {badges.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-sm border border-[#3a3a3a] px-1.5 py-0.5 text-[8px] text-[#b8b8b8]"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {rewardValuation && (
        <div className="mb-2 flex min-w-0 items-center justify-between gap-2 border-t border-[#303030] pt-2 text-[10px]">
          <span className="flex min-w-0 items-center gap-1.5 text-[color:var(--oshi-white)]/55">
            <Gift className="h-3.5 w-3.5 shrink-0 text-[#8CFF57]" aria-hidden="true" />
            <span className="truncate">확정 보상 가치</span>
          </span>
          <strong className="shrink-0 whitespace-nowrap font-medium text-[#dfffe9]">
            약 {formatRewardValuationAmount(rewardValuation)}
          </strong>
        </div>
      )}

      {rewards.length > 0 && (
        <details className="group mb-2 border-t border-[#303030] pt-2 text-[10px] text-[#d8d8d8]">
          <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#27FFBB]/70 [&::-webkit-details-marker]:hidden">
            <span className="flex min-w-0 items-center gap-1.5">
              <Gift className="h-3.5 w-3.5 shrink-0 text-[#8CFF57]" aria-hidden="true" />
              <span className="truncate">보상 {rewards.length}종</span>
            </span>
            <ChevronDown
              className="h-3.5 w-3.5 shrink-0 text-[color:var(--oshi-white)]/45 transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </summary>
          <dl className="mt-1.5 space-y-1 border-t border-[#2b2b2b] pt-1.5">
            {rewards.map((reward) => (
              <div
                key={reward.name}
                className="grid grid-cols-[minmax(0,1fr)_max-content] items-start gap-2 leading-4"
              >
                <dt className="min-w-0 break-keep break-words text-[color:var(--oshi-white)]/55">
                  {reward.name}
                </dt>
                <dd className="m-0 whitespace-nowrap text-right font-medium text-[#dfffe9]">
                  {formatRewardAmount(reward.amount)}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_max-content] items-center gap-2 text-[8px] text-[color:var(--oshi-white)]/40">
        <div className="flex min-w-0 items-center gap-1 whitespace-nowrap">
          <time dateTime={item.startAt.toISOString()}>
            {formatCalendarDate(item.startAt, "yyyy.MM.dd")}
          </time>
          <span>~</span>
          <time dateTime={item.endAt.toISOString()}>
            {formatCalendarDate(item.endAt, "yyyy.MM.dd")}
          </time>
        </div>
        <strong className="whitespace-nowrap font-normal">
          {formatTimeLeft(item.daysLeft, item.remainingMs)}
        </strong>
      </div>
    </article>
  );
}
