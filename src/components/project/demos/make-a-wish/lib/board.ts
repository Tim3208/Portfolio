/**
 * 원본: src/features/stamps/lib/board.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 부스 타입을 가져오는 경로만 변경. 배정 로직은 줄 단위로 보존.
 */
import type { Booth, BoothCategory } from '../types'
import type { MyStamp } from '../types'

export type StampSlots = readonly [
  MyStamp | null,
  MyStamp | null,
  MyStamp | null,
  MyStamp | null,
  MyStamp | null,
  MyStamp | null,
]

export type StampBoardResult =
  { status: 'ready'; slots: StampSlots } | { status: 'unresolved'; boothIds: number[] }

type StampBooth = Pick<Booth, 'id' | 'category'>

function getStampGroup(category: BoothCategory | null | undefined) {
  switch (category) {
    case 'EXTERNAL':
      return 'external'
    case 'STUDENT_COUNCIL':
    case 'CAMPUS':
    case 'GENERAL':
    case 'OTHER':
    case 'FOOD_TRUCK':
    case 'PHOTO_BOOTH':
      return 'general'
    default:
      return null
  }
}

/** 현재 지급 내역을 시간순으로 배정한다. 회수된 내역은 다음 조회에서 자연스럽게 빠진다. */
export function buildStampBoard(
  stamps: readonly MyStamp[],
  booths: readonly StampBooth[],
): StampBoardResult {
  const categories = new Map<number, BoothCategory | null>()
  for (const booth of booths) {
    if (booth.id === null) continue
    // 같은 ID가 여러 번 오면 어느 분류가 맞는지 추측하지 않는다.
    categories.set(booth.id, categories.has(booth.id) ? null : booth.category)
  }

  const unresolved = stamps.filter((stamp) => !getStampGroup(categories.get(stamp.boothId)))
  if (unresolved.length) {
    return {
      status: 'unresolved',
      boothIds: [...new Set(unresolved.map((stamp) => stamp.boothId))],
    }
  }

  const ordered = [...stamps].sort(
    (left, right) =>
      Date.parse(left.grantedAt) - Date.parse(right.grantedAt) || left.boothId - right.boothId,
  )
  const general = ordered.filter(
    (stamp) => getStampGroup(categories.get(stamp.boothId)) === 'general',
  )
  const external = ordered.find(
    (stamp) => getStampGroup(categories.get(stamp.boothId)) === 'external',
  )

  return {
    status: 'ready',
    slots: [
      general[0] ?? null,
      general[1] ?? null,
      general[2] ?? null,
      general[3] ?? null,
      general[4] ?? null,
      external ?? null,
    ],
  }
}
