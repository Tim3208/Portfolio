/**
 * 원본: src/entities/event/model/types.ts · 기준 커밋: 40c516b.
 * 변경: 원본 타입·표시 계약·순수 로직을 수정 없이 옮겼다.
 */
export type CategoryId = 'event' | 'pickup' | 'update' | 'redeem' | 'maintenance'

export type CategoryFilter = {
  id: CategoryId
  label: string
  color: string
}

export type ScheduleItemTone = 'green' | 'orange' | 'lime' | 'blue' | 'amber'

export type ContentItemKind = 'event' | 'pickup' | 'update' | 'redeem_code'

export type ReviewStatus = 'verified' | 'needs_review' | 'unknown'

export type BasisType =
  | 'official_confirmed'
  | 'official_derived'
  | 'community_estimate'

export type Confidence = 'high' | 'medium' | 'low' | 'unknown'

export type JsonPrimitive = string | number | boolean | null

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue }

export type RewardItem = {
  name: string
  amount: number | string
}

export type ValuationCategory =
  | 'shared_gacha'
  | 'character_gacha'
  | 'weapon_gacha'
  | 'standard_gacha'

/** 백엔드가 확정 뽑기 보상에 적용한 항목별 환산 결과다. 화면은 이 값을 다시 계산하지 않는다. */
export type RewardValuationComponent = {
  reward_code: string
  name?: string
  quantity: number
  unit?: string
  display_order: number
  valuation_category: ValuationCategory
  paid_currency_equivalent: number
  amount_krw_exact: number
  amount_krw: number
}

export type ExcludedRewardItem = {
  reward_code?: string
  name?: string
  quantity?: number
  display_order: number
  reason:
    | 'invalid_item'
    | 'non_guaranteed'
    | 'missing_or_invalid_quantity'
    | 'non_positive_quantity'
    | 'no_cash_valuation_rule'
}

export type RewardValuationBasis = {
  policy: 'best_repeatable_permanent_topup'
  platform: 'pc'
  region_code: 'KR'
  currency: 'KRW'
  as_of: string
  rate_version: string
  paid_currency_code: string
  package_code: string
  price_krw: number
  repeat_purchase_quantity: number
  base_paid_quantity?: number
  recurring_bonus_quantity?: number
  valid_from: string
  valid_to?: string
}

/**
 * 서버가 최종 합산·반올림까지 완료한 보상 환산 결과다.
 * 대표 금액은 반드시 `amount_krw`만 사용하며, component 금액 합산으로 대체하면 안 된다.
 */
export type RewardValuation = {
  schema_version: 1
  currency: 'KRW'
  amount_krw: number
  amount_krw_exact: number
  qualifier: 'approximate'
  valuation_scope: 'guaranteed_cash_linked_gacha_rewards'
  rounding: 'final_total_nearest_krw'
  valued_item_count: number
  excluded_item_count: number
  components: RewardValuationComponent[]
  excluded_items: ExcludedRewardItem[]
  basis: RewardValuationBasis
}

export type ScheduleItem = {
  id: string
  gameId?: string | null
  game: string
  gameName?: string
  gameImageUrl?: string
  title: string
  categoryId: CategoryId
  startAt: Date
  endAt: Date
  tone: ScheduleItemTone
  rewards?: readonly RewardItem[]
  rewardValuation?: RewardValuation | null
  reviewStatus?: ReviewStatus
  confidence?: Confidence
  basisType?: BasisType | null
}

export type CalendarScheduleItem = Omit<ScheduleItem, 'gameId' | 'rewardValuation'> & {
  gameId: string | null
  rewardValuation: RewardValuation | null
  kind: ContentItemKind
  reviewStatus: ReviewStatus
  confidence: Confidence
  basisType: BasisType | null
  sourceTier: string | null
  detectedAt: string | null
}

export type CalendarScheduleApiItem = Omit<
  CalendarScheduleItem,
  'startAt' | 'endAt'
> & {
  startAt: string
  endAt: string
}

export type ImminentScheduleItem = ScheduleItem & {
  daysLeft: number
  remainingMs: number
}
