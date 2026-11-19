/**
 * 원본: src/pages/dashboard/model/scheduleDataStatus.ts · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다.
 */
import type { CalendarViewMode } from "../shared/lib/date";

export type ScheduleDataQueryState = {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly isFetching: boolean;
};

export type ScheduleDataStageCounts = {
  readonly remoteItemCount: number;
  readonly excludedItemCount: number;
  readonly activeGameItemCount: number;
  readonly categoryItemCount: number;
  readonly visibleRangeItemCount: number;
  readonly viewMode: CalendarViewMode;
  readonly hiddenGameLabels: readonly string[];
};

export type DashboardScheduleDataStatus = {
  readonly tone: "loading" | "error" | "empty" | "degraded" | "live";
  readonly label: string;
  readonly message: string;
};

/** 숨긴 게임명은 보조 메시지에만 붙여, 상태 판단 로직과 사용자용 문구 생성을 분리한다. */
function formatHiddenGameSummary(labels: readonly string[]) {
  return labels.length > 0 ? `: ${labels.join(", ")}` : "";
}

/** 일정이 없을 때도 어떤 보기 범위가 비었는지 설명하기 위한 사용자용 보기 이름이다. */
const calendarViewLabels: Record<CalendarViewMode, string> = {
  month: "월간",
  week: "주간",
  day: "일간",
};

/**
 * 원격 조회와 게임/카테고리/기간 필터의 각 단계를 우선순위대로 상태 메시지로 축약한다.
 * 조건 순서는 사용자가 조치할 수 있는 원인부터 보여 주는 UI 계약이므로 임의로 재배열하지 않는다.
 */
export function createScheduleDataStatus(
  query: ScheduleDataQueryState,
  counts: ScheduleDataStageCounts,
): DashboardScheduleDataStatus {
  if (query.isLoading) {
    return {
      tone: "loading",
      label: "일정 불러오는 중",
      message: "서버 일정을 확인하고 있습니다.",
    };
  }

  if (query.isError) {
    return {
      tone: "error",
      label: "일정 동기화 실패",
      message: "서버 일정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (counts.excludedItemCount > 0) {
    return {
      tone: "degraded",
      label: "일부 일정 확인 필요",
      message: `데이터 품질 문제로 일정 ${counts.excludedItemCount}건을 표시하지 않았습니다.`,
    };
  }

  if (counts.remoteItemCount === 0) {
    return {
      tone: "empty",
      label: "서버 일정 없음",
      message: "현재 표시할 서버 일정이 없습니다.",
    };
  }

  if (counts.activeGameItemCount === 0) {
    return {
      tone: "live",
      label: "게임 필터 숨김",
      message: `서버 일정 ${counts.remoteItemCount}건이 현재 활성 게임 필터에 숨겨졌습니다${formatHiddenGameSummary(
        counts.hiddenGameLabels,
      )}`,
    };
  }

  if (counts.categoryItemCount === 0) {
    return {
      tone: "live",
      label: "카테고리 필터 숨김",
      message: `활성 게임 일정 ${counts.activeGameItemCount}건이 선택 카테고리에서 숨겨졌습니다.`,
    };
  }

  if (counts.visibleRangeItemCount === 0) {
    return {
      tone: "live",
      label: "실제 데이터",
      message: `서버 일정 ${counts.categoryItemCount}건이 있지만 현재 ${calendarViewLabels[counts.viewMode]} 보기에는 표시할 일정이 없습니다.`,
    };
  }

  if (query.isFetching) {
    return {
      tone: "loading",
      label: "일정 동기화 중",
      message: "최신 서버 일정을 확인하는 중입니다.",
    };
  }

  return {
    tone: "live",
    label: "실제 데이터",
    message: `서버 일정 ${counts.visibleRangeItemCount}건이 ${calendarViewLabels[counts.viewMode]} 캘린더에 반영되었습니다.`,
  };
}
