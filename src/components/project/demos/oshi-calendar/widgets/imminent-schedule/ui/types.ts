/**
 * 원본: src/widgets/imminent-schedule/ui/types.ts · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 안내 생략을 위한 null 상태를 받는다.
 */
import type { ImminentScheduleItem } from "../../../entities/event/model";

export type ImminentScheduleProps = {
  readonly collapsed: boolean;
  readonly items: readonly ImminentScheduleItem[];
  readonly dataStatus: ScheduleDataStatus | null;
  readonly onToggleCollapsed: () => void;
};

export type ScheduleDataStatus = {
  readonly tone: "loading" | "error" | "empty" | "degraded" | "live";
  readonly label: string;
  readonly message: string;
};

export type ImminentScheduleGroup = {
  readonly daysLeft: number;
  readonly items: readonly ImminentScheduleItem[];
};
