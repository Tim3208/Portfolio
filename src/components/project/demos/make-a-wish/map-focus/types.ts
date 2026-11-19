/**
 * 원본: src/features/booths/components/BoothSheet.tsx · src/features/booths/lib/category.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 이동 계산이 기대는 시트 단계 · 높이 비율 · 필터 타입만 옮김.
 *       시트 단계와 높이 비율 7줄은 팀원 Archibald1948 이 작성한 원본 값이다.
 */
import type { BoothCategory } from '../types'

export type BoothSheetSnap = 'collapsed' | 'half' | 'expanded'

export type BoothFilter = 'ALL' | 'FAVORITE' | BoothCategory

/** 시안 852px 기준의 시트 상단 위치(지도->끝까지올림 128, ->반만 402, ->맨아래 660). */
export const SNAP_RATIOS: Record<BoothSheetSnap, number> = {
  expanded: 128 / 852,
  half: 402 / 852,
  collapsed: 660 / 852,
}
