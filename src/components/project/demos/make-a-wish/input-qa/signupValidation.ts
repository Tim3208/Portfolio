/**
 * 원본: Tim3208/Make-A-Wish_FE src/features/auth/signupValidation.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 비밀번호·선택 정보 검증과 전화번호 정규화를 추출. 함수 본문은 원문 유지.
 * 가입 의존성을 옮기지 않고 선택 정보 검증에 필요한 원본 필드 타입만 파일 안에 둔다.
 * 데모는 전화번호 외 선택 정보를 빈 값으로 넘겨 전화번호 오류만 사용한다.
 */
type SignupDraft = {
  phone: string
  grade: string
  enrollment: '' | 'ENROLLED' | 'LEAVE'
  birthDate: string
}
type SignupFieldErrors = Partial<Record<keyof SignupDraft, string>>

export function validateSignupPassword(value: string) {
  return !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])[\x21-\x7E]{8,20}$/.test(value)
    ? '8–20자의 영문 대문자·소문자·숫자·특수문자를 모두 포함해 주세요. 공백은 사용할 수 없습니다.'
    : undefined
}

export const normalizePhone = (value: string) => value.replace(/[ -]/g, '')

export function validateOptionalInfo(draft: SignupDraft): SignupFieldErrors {
  const errors: SignupFieldErrors = {}
  if (draft.phone && !/^[0-9]{10,11}$/.test(normalizePhone(draft.phone))) {
    errors.phone = '전화번호는 숫자 10–11자리로 입력해 주세요.'
  }
  if (draft.grade && !/^[1-6]$/.test(draft.grade)) errors.grade = '학년을 1–6학년 중 선택해 주세요.'
  if (draft.enrollment && !['ENROLLED', 'LEAVE'].includes(draft.enrollment)) {
    errors.enrollment = '재학 또는 휴학을 선택해 주세요.'
  }
  if (draft.birthDate) {
    const date = new Date(`${draft.birthDate}T00:00:00Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(draft.birthDate) ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== draft.birthDate
    )
      errors.birthDate = '올바른 생년월일을 입력해 주세요.'
  }
  return errors
}
