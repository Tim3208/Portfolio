/**
 * 원본: src/entities/event/model/index.ts · 기준 커밋: 40c516b.
 * 변경: 원본 타입·표시 계약·순수 로직을 수정 없이 옮겼다.
 */
export { mockCategories } from './mock'
export { categoryPresentationById } from "./categoryPresentation";
export type { CategoryPresentation } from "./categoryPresentation";
export type {
  BasisType,
  CalendarScheduleApiItem,
  CalendarScheduleItem,
  CategoryFilter,
  CategoryId,
  Confidence,
  ContentItemKind,
  ImminentScheduleItem,
  JsonValue,
  ExcludedRewardItem,
  RewardItem,
  RewardValuation,
  RewardValuationBasis,
  RewardValuationComponent,
  ReviewStatus,
  ScheduleItem,
  ScheduleItemTone,
  ValuationCategory,
} from './types'
