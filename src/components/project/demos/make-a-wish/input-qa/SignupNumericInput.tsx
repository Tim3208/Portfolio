/**
 * 원본: Tim3208/Make-A-Wish_FE src/features/auth/components/SignupNumericInput.tsx
 * 기준 커밋: 436b5ef
 * 변경: 같은 폴더로 옮긴 서식 함수의 import 경로만 조정. 컴포넌트 본문은 원본 그대로다.
 */
import { useRef, useState, type InputHTMLAttributes } from 'react'
import { formatSignupInputEdit } from './signupInputFormatting'

type SignupNumericInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'inputMode' | 'type'
> & {
  value: string
  type?: 'text' | 'tel'
  format: (value: string) => string
  onValueChange: (value: string) => void
}

/** 숫자 서식과 커서를 함께 갱신하며 조합 입력은 완료 후 정리한다. */
export function SignupNumericInput({
  value,
  type = 'text',
  format,
  onValueChange,
  onCompositionStart,
  onCompositionEnd,
  ...inputProps
}: SignupNumericInputProps) {
  const composing = useRef(false)
  const [compositionValue, setCompositionValue] = useState<string | null>(null)
  const formattedValue = format(value)

  const update = (input: HTMLInputElement, inputType: string) => {
    const edit = formatSignupInputEdit(input.value, input.selectionStart, inputType, format)
    input.value = edit.value
    input.setSelectionRange(edit.caret, edit.caret)
    // 숫자가 바뀌지 않은 입력은 이미 완료된 전화번호 중복 확인을 유지한다.
    if (edit.value !== formattedValue) onValueChange(edit.value)
  }

  return (
    <input
      {...inputProps}
      type={type}
      inputMode="numeric"
      value={compositionValue ?? formattedValue}
      onChange={(event) => {
        if (composing.current) {
          setCompositionValue(event.currentTarget.value)
          return
        }
        update(event.currentTarget, (event.nativeEvent as InputEvent).inputType ?? '')
      }}
      onCompositionStart={(event) => {
        composing.current = true
        setCompositionValue(event.currentTarget.value)
        onCompositionStart?.(event)
      }}
      onCompositionEnd={(event) => {
        composing.current = false
        setCompositionValue(null)
        update(event.currentTarget, 'insertCompositionText')
        onCompositionEnd?.(event)
      }}
    />
  )
}
