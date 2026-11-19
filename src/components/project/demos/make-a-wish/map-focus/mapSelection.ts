/**
 * 원본: src/features/booths/lib/mapSelection.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 시트 단계 · 필터 타입을 가져오는 경로만 변경. 선택과 이동 요청을 나누는 reducer 는 줄 단위로 보존.
 */
import type { BoothFilter, BoothSheetSnap } from './types'

export type BoothMapSelectionState = {
  filter: BoothFilter
  snap: BoothSheetSnap
  selectedBoothId: number | null
  focusRequestId: number
  overviewRequestId: number
}

export type BoothMapSelectionAction =
  | { type: 'select'; id: number }
  | { type: 'snap'; snap: BoothSheetSnap }
  | { type: 'filter'; filter: BoothFilter; selectedIsVisible: boolean }
  | { type: 'overview' }
  | { type: 'removed' }

export const INITIAL_BOOTH_MAP_SELECTION: BoothMapSelectionState = {
  filter: 'ALL',
  snap: 'half',
  selectedBoothId: null,
  focusRequestId: 0,
  overviewRequestId: 0,
}

/** 선택 표시와 카메라 이동 요청을 분리해 데이터 갱신으로 인한 자동 이동을 막는다. */
export function boothMapSelectionReducer(
  state: BoothMapSelectionState,
  action: BoothMapSelectionAction,
): BoothMapSelectionState {
  switch (action.type) {
    case 'select':
      return {
        ...state,
        selectedBoothId: action.id,
        // 같은 부스의 재선택도 새로운 이동 요청으로 처리한다.
        focusRequestId: state.focusRequestId + 1,
        snap: state.snap === 'expanded' ? 'half' : state.snap,
      }
    case 'snap':
      return state.snap === action.snap ? state : { ...state, snap: action.snap }
    case 'filter':
      if (state.filter === action.filter) return state
      if (state.selectedBoothId !== null && action.selectedIsVisible) {
        return { ...state, filter: action.filter }
      }
      return {
        ...state,
        filter: action.filter,
        selectedBoothId: null,
        overviewRequestId: state.overviewRequestId + 1,
      }
    case 'overview':
      return {
        ...state,
        selectedBoothId: null,
        overviewRequestId: state.overviewRequestId + 1,
      }
    case 'removed':
      // 갱신으로 사라진 선택만 해제한다. 지도 위치와 배율은 유지한다.
      return state.selectedBoothId === null ? state : { ...state, selectedBoothId: null }
  }
  return state
}
