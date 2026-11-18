/**
 * 원본: src/features/stamps/types.ts · src/features/booths/types.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: Swagger 의존 타입을 같은 필드 타입으로 명시. 부스는 별 배정에 필요한 필드만 유지.
 */

/** 검증된 지급 내역. 부스 위치나 별 배정 순서는 이 자료에 포함하지 않는다. */
export type MyStamp = {
  boothId: number
  boothName: string
  grantedAt: string
  operator: string | null
}

export type MyStampBoard = {
  participated: boolean
  stampCount: number
  stamps: MyStamp[]
}

/** 운영 API가 내려주는 부스 분류 7종(2026-09-26 기준). */
export const BOOTH_CATEGORIES = [
  'STUDENT_COUNCIL',
  'CAMPUS',
  'GENERAL',
  'EXTERNAL',
  'OTHER',
  'FOOD_TRUCK',
  'PHOTO_BOOTH',
] as const

export type BoothCategory = (typeof BOOTH_CATEGORIES)[number]

/** 별 배정에서 참조하는 부스 필드만 유지한다. */
export type Booth = {
  id: number | null
  category: BoothCategory | null
}
