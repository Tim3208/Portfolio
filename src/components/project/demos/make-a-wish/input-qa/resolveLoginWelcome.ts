/**
 * 원본: src/features/auth/loginWelcome.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 같은 폴더의 LoginWelcome.tsx와 경로가 충돌하지 않게 파일 이름을 바꾸고,
 * 세션 구현 없이 원본 AuthStatus 타입만 파일 안에 둔다. 판정 함수는 원문 유지.
 */
type AuthStatus = 'initializing' | 'authenticated' | 'anonymous' | 'unavailable'

type WelcomeProfile = { name?: unknown; studentFeePaid?: unknown }

export type LoginWelcome = {
  sessionVersion: number
  name: string
  suffix: string
  isPaid: boolean
}

/** 성공한 현재 세션의 프로필만 사용한다. 이름과 납부 값은 런타임에서도 확인한다. */
export function resolveLoginWelcome({
  status,
  sessionVersion,
  pendingWelcomeSession,
  profileSessionVersion,
  isSuccess,
  profile,
}: {
  status: AuthStatus
  sessionVersion: number
  pendingWelcomeSession: number | null
  profileSessionVersion: number
  isSuccess: boolean
  profile: WelcomeProfile | null | undefined
}): LoginWelcome | null {
  if (
    status !== 'authenticated' ||
    pendingWelcomeSession !== sessionVersion ||
    profileSessionVersion !== sessionVersion ||
    !isSuccess ||
    !profile ||
    typeof profile !== 'object' ||
    Array.isArray(profile)
  ) {
    return null
  }
  const name = typeof profile.name === 'string' ? profile.name.trim() : ''
  return {
    sessionVersion,
    name: name || '회원',
    suffix: '님',
    isPaid: profile.studentFeePaid === true,
  }
}
