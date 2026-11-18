/**
 * 원본: src/features/stamps/api/getMyStamps.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: API 호출을 제거하고 ApiError를 로컬 클래스로 대체하며 readBoard를 내보낸다. 검증 로직은 줄 단위로 보존.
 */
import type { MyStamp, MyStampBoard } from '../types'

const INSTANT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

function invalidResponse(): never {
  throw new ApiError(
    200,
    'INVALID_STAMP_RESPONSE',
    '스탬프 정보를 확인하지 못했습니다. 다시 시도해 주세요.',
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function readStamp(value: unknown): MyStamp {
  if (
    !isRecord(value) ||
    typeof value.boothId !== 'number' ||
    !Number.isSafeInteger(value.boothId) ||
    value.boothId <= 0 ||
    typeof value.boothName !== 'string' ||
    !value.boothName.trim() ||
    typeof value.grantedAt !== 'string' ||
    !INSTANT_PATTERN.test(value.grantedAt) ||
    !Number.isFinite(Date.parse(value.grantedAt)) ||
    (value.operator != null && typeof value.operator !== 'string')
  ) {
    return invalidResponse()
  }

  return {
    boothId: value.boothId,
    boothName: value.boothName.trim(),
    operator: typeof value.operator === 'string' ? value.operator.trim() || null : null,
    grantedAt: value.grantedAt,
  }
}

/** 누락된 응답이나 중복 지급 내역을 정상적인 빈 스탬프판으로 표시하지 않는다. */
function readBoard(value: unknown): MyStampBoard {
  if (
    !isRecord(value) ||
    typeof value.participated !== 'boolean' ||
    typeof value.stampCount !== 'number' ||
    !Number.isSafeInteger(value.stampCount) ||
    value.stampCount < 0 ||
    !Array.isArray(value.stamps) ||
    value.stampCount !== value.stamps.length
  ) {
    return invalidResponse()
  }

  const stamps = value.stamps.map(readStamp)
  if (new Set(stamps.map((stamp) => stamp.boothId)).size !== stamps.length) {
    return invalidResponse()
  }

  return { participated: value.participated, stampCount: value.stampCount, stamps }
}

// Preserve the original error construction without a network client.
class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export { readBoard }
