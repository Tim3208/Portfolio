/**
 * 원본: Tim3208/Make-A-Wish_FE src/features/auth/recoveryValidation.ts
 * 기준 커밋: 436b5ef
 * 변경: 쓰지 않는 이메일 검증 별칭과 import만 제외. 코드·아이디 함수와 비밀번호 별칭은 원문 그대로다.
 */
import { validateSignupPassword } from './signupValidation'

/** 복구 DTO는 가입의 4–12자 코드와 달리 ASCII 숫자 6자리만 허용한다. */
export function validateRecoveryCode(value: string) {
  return /^[0-9]{6}$/.test(value) ? undefined : '이메일로 받은 숫자 6자리 인증번호를 입력해 주세요.'
}

/** 기존 로그인 아이디 원문을 유지하며 가입의 4–50자 제한을 적용하지 않는다. */
export function validateRecoveryId(value: string) {
  if (!value.trim()) return '아이디를 입력해 주세요.'
  return value.length > 100 ? '아이디는 100자 이내로 입력해 주세요.' : undefined
}

export const validateRecoveryPassword = validateSignupPassword
