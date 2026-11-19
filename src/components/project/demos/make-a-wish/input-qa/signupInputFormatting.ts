/**
 * 원본: Tim3208/Make-A-Wish_FE src/features/auth/signupInputFormatting.ts
 * 기준 커밋: 436b5ef
 * 변경: 데모에서 쓰지 않는 생년월일 함수만 제외. 전화번호·숫자 분할·커서 계산은 원문 그대로다.
 */
const digitsOnly = (value: string) => value.replace(/[^0-9]/g, '')

function groupDigits(value: string, sizes: number[], separator: string) {
  let offset = 0
  return sizes
    .map((size) => {
      const part = value.slice(offset, offset + size)
      offset += size
      return part
    })
    .filter(Boolean)
    .join(separator)
}

/** 기존 10·11자리 전화번호를 입력 길이에 맞춰 하이픈으로 구분한다. */
export function formatSignupPhoneInput(value: string) {
  const digits = digitsOnly(value).slice(0, 11)
  return groupDigits(digits, [3, digits.length === 11 ? 4 : 3, 4], '-')
}

/** 자동으로 붙는 구분자와 무관하게 커서 앞 숫자의 개수를 유지한다. */
export function formatSignupInputEdit(
  value: string,
  selectionStart: number | null,
  inputType: string,
  format: (value: string) => string,
) {
  const formatted = format(value)
  const digitsBeforeCaret = digitsOnly(value.slice(0, selectionStart ?? value.length)).length
  let caret = 0
  let seen = 0
  while (caret < formatted.length && seen < digitsBeforeCaret) {
    if (/[0-9]/.test(formatted[caret])) seen += 1
    caret += 1
  }
  // Delete로 구분자를 지웠을 때 커서를 뒤로 넘겨 같은 위치에 갇히지 않게 한다.
  if (inputType === 'deleteContentForward') {
    while (caret < formatted.length && !/[0-9]/.test(formatted[caret])) caret += 1
  }
  return { value: formatted, caret }
}
