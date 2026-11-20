/**
 * 원본: src/features/booths/lib/category.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 마커 그림을 공개 경로로만 바꿈. 팀원 Archibald1948 이 작성한 파일이다.
 */
import type { Booth, BoothCategory } from './types'

const foodTruckMarker = '/images/projects/make-a-wish/booths/marker-food-truck.svg'
const generalMarker = '/images/projects/make-a-wish/booths/marker-general.svg'
const photoMarker = '/images/projects/make-a-wish/booths/marker-photo.svg'
const studentCouncilMarker = '/images/projects/make-a-wish/booths/marker-student-council.svg'

/** 전체/북마크는 카테고리가 아니라 목록 전체에 거는 조건이다. */
export type BoothFilter = 'ALL' | 'FAVORITE' | BoothCategory

type ChipDefinition = {
  id: BoothFilter
  label: string
}

/**
 * 시안(1692:6619)의 칩 순서를 그대로 따른다.
 * 운영 API의 GENERAL은 시안에 대응하는 칩이 없어 '전체'에서만 보인다.
 * 칩을 추가할 때는 이 배열에 한 줄만 넣으면 된다.
 */
export const BOOTH_FILTER_CHIPS: readonly ChipDefinition[] = [
  { id: 'ALL', label: '전체' },
  { id: 'FAVORITE', label: '북마크' },
  { id: 'STUDENT_COUNCIL', label: '학생회' },
  { id: 'FOOD_TRUCK', label: '푸드트럭' },
  { id: 'CAMPUS', label: '교내부스' },
]

/** 백엔드가 알려준 짧은 표기. 관리자 화면의 긴 이름(예: '교내 기관·부서 운영 부스')은 카드에 넣기엔 길다. */
const CATEGORY_LABELS: Record<BoothCategory, string> = {
  STUDENT_COUNCIL: '학생회',
  CAMPUS: '교내기관',
  GENERAL: '일반부스',
  EXTERNAL: '외부업체',
  OTHER: '기타',
  FOOD_TRUCK: '푸드트럭',
  PHOTO_BOOTH: '포토부스',
}

/** 시안 '부스별 아이콘'(1749:1268)의 마커. 대응 아이콘이 없으면 일반 부스 아이콘을 쓴다. */
const CATEGORY_MARKERS: Record<BoothCategory, string> = {
  STUDENT_COUNCIL: studentCouncilMarker,
  CAMPUS: generalMarker,
  GENERAL: generalMarker,
  EXTERNAL: generalMarker,
  OTHER: generalMarker,
  FOOD_TRUCK: foodTruckMarker,
  PHOTO_BOOTH: photoMarker,
}

export function getBoothCategoryLabel(category: BoothCategory | null) {
  return category === null ? '부스' : CATEGORY_LABELS[category]
}

export function getBoothMarkerIcon(category: BoothCategory | null) {
  return category === null ? generalMarker : CATEGORY_MARKERS[category]
}

export function matchesBoothFilter(booth: Booth, filter: BoothFilter) {
  if (filter === 'ALL') return true
  if (filter === 'FAVORITE') return booth.favorited
  return booth.category === filter
}

export function filterBooths(booths: readonly Booth[], filter: BoothFilter) {
  return booths.filter((booth) => matchesBoothFilter(booth, filter))
}
