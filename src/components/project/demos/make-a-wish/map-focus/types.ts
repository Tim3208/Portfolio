/**
 * 원본: src/features/booths/types.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 서버 응답 타입과 정규화 함수는 옮기지 않고 화면이 쓰는 Booth 타입만 유지.
 *       분류는 스탬프 데모와 같은 타입을 쓴다. 팀원 Archibald1948 이 작성한 파일이다.
 */
import type { BoothCategory } from '../types'

export type { BoothCategory }

export type Booth = {
  id: number | null
  name: string | null
  operator: string | null
  description: string | null
  category: BoothCategory | null
  latitude: number | null
  longitude: number | null
  opensAt: string | null
  closesAt: string | null
  stampEnabled: boolean
  favorited: boolean
  favoriteCount: number | null
  imageUrl: string | null
}
