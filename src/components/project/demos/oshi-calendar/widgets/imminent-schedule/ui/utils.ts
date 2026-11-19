/**
 * 원본: src/widgets/imminent-schedule/ui/utils.ts · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다.
 */
import type {
  ImminentScheduleItem,
  RewardValuation,
} from "../../../entities/event/model";
import { confidenceLabels } from "./constants";
import type { ImminentScheduleGroup } from "./types";

/** 검토·근거·신뢰도 정보를 카드의 짧은 badge 목록으로 축약해, 확인이 필요한 일정만 강조한다. */
export function getScheduleBadges(item: ImminentScheduleItem) {
  return [
    item.reviewStatus === "needs_review" ? "검수 전" : null,
    item.basisType === "community_estimate" ? "커뮤니티 추정" : null,
    item.confidence && item.confidence !== "high"
      ? confidenceLabels[item.confidence]
      : null,
  ].filter((badge): badge is string => Boolean(badge));
}

export function getGameInitial(item: ImminentScheduleItem) {
  const gameName = item.gameName ?? item.game;
  return gameName.trim().slice(0, 1) || "?";
}

/** 종료 임박 표현의 경계값을 한 단위로 유지해 D-day와 시간 표기가 서로 어긋나지 않게 한다. */
const HOUR_MS = 60 * 60 * 1_000;
const DAY_MS = 24 * HOUR_MS;
const rewardAmountFormatter = new Intl.NumberFormat("ko-KR");
const rewardValuationFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

/** 남은 시간이 하루 이하면 올림한 시간으로, 그보다 길면 서비스 날짜 기준 D-day로 표시한다. */
export function formatTimeLeft(daysLeft: number, remainingMs: number) {
  if (remainingMs <= 0) {
    return "마감됨";
  }

  if (remainingMs <= DAY_MS) {
    return `${Math.ceil(remainingMs / HOUR_MS)}시간 남음`;
  }

  return `${daysLeft}일 남음`;
}

export function formatRewardAmount(amount: number | string) {
  return typeof amount === "number"
    ? rewardAmountFormatter.format(amount)
    : amount;
}

/** 서버가 최종 합산·반올림한 대표 환산값만 통화 형식으로 표시한다. */
export function formatRewardValuationAmount(rewardValuation: RewardValuation) {
  return rewardValuationFormatter.format(rewardValuation.amount_krw);
}

export function formatGroupLabel(daysLeft: number) {
  if (daysLeft === 0) {
    return "이걸 놓쳐?";
  }

  if (daysLeft < 0) {
    return "마감됨";
  }

  return `D - ${daysLeft}`;
}

/**
 * 임박 일정의 정렬 계약은 상위에서 받은 순서를 그룹 내부에 보존하고,
 * 그룹만 daysLeft 오름차순으로 배치해 가장 급한 마감부터 훑을 수 있게 한다.
 */
export function groupImminentScheduleItems(
  items: readonly ImminentScheduleItem[],
): ImminentScheduleGroup[] {
  const groupsByDaysLeft = new Map<number, ImminentScheduleItem[]>();

  items.forEach((item) => {
    const groupItems = groupsByDaysLeft.get(item.daysLeft);

    if (groupItems) {
      groupItems.push(item);
      return;
    }

    groupsByDaysLeft.set(item.daysLeft, [item]);
  });

  return Array.from(groupsByDaysLeft.entries())
    .sort(([leftDays], [rightDays]) => leftDays - rightDays)
    .map(([daysLeft, groupItems]) => ({
      daysLeft,
      items: groupItems,
    }));
}
