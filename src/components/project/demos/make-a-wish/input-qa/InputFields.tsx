/**
 * 원본: Tim3208/Make-A-Wish_FE src/features/auth/components/SignupScreen.tsx,
 * SignupFrame.tsx, RecoveryCard.tsx, AuthFeedback.tsx
 * 기준 커밋: 436b5ef
 * 변경: 가입 전화번호와 복구 입력란 세 개의 마크업·클래스·오류 표시를 한 화면에 모았다.
 * 컨트롤러 대신 부모의 값·오류·이벤트를 받고, 자동 초점과 API·제출 흐름은 옮기지 않는다.
 * ID는 useId로 격리하고 비밀번호는 글자로 표시하며 모든 자동완성을 끈다.
 * 아이디의 maxLength는 100/101자 경계 검증을 위해 제거했다. 오류 문구·role·aria는 유지한다.
 * Tabler 오류 아이콘만 인라인 SVG로 바꿨다.
 */
import { useId } from 'react'
import { SignupNumericInput } from './SignupNumericInput'
import { formatSignupPhoneInput } from './signupInputFormatting'
import entry from './entry.module.css'
import recovery from './recovery.module.css'

export type InputQaValues = {
  phone: string
  password: string
  code: string
  loginId: string
}

export type InputQaErrors = Partial<Record<keyof InputQaValues, string>>

export function InputFields({
  values,
  errors,
  onValueChange,
  onPhoneBlur,
}: {
  values: InputQaValues
  errors: InputQaErrors
  onValueChange: (field: keyof InputQaValues, value: string) => void
  onPhoneBlur: () => void
}) {
  const prefix = useId()
  const id = (field: keyof InputQaValues) => `${prefix}-${field}`
  const errorId = (field: keyof InputQaValues) => `${prefix}-error-${field}`
  const passwordHintId = `${prefix}-password-hint`

  function describedBy(field: keyof InputQaValues) {
    return (
      [errors[field] ? errorId(field) : '', field === 'password' ? passwordHintId : '']
        .filter(Boolean)
        .join(' ') || undefined
    )
  }

  function input(field: 'password' | 'code' | 'loginId', placeholder: string) {
    return (
      <input
        id={id(field)}
        name={id(field)}
        type="text"
        value={values[field]}
        onChange={(event) => onValueChange(field, event.target.value)}
        placeholder={placeholder}
        maxLength={field === 'code' ? 6 : field === 'password' ? 20 : undefined}
        inputMode={field === 'code' ? 'numeric' : undefined}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        required
        aria-invalid={Boolean(errors[field])}
        aria-describedby={describedBy(field)}
        className={recovery.input}
      />
    )
  }

  return (
    <div className={entry.fieldsScreen}>
      <div className={recovery.card}>
        <div className={entry.signupField}>
          <div className={entry.signupFieldRow}>
            <label htmlFor={id('phone')}>전화번호</label>
            <div className={entry.signupFieldControl}>
              <SignupNumericInput
                id={id('phone')}
                name={id('phone')}
                type="tel"
                autoComplete="off"
                value={values.phone}
                format={formatSignupPhoneInput}
                className={entry.signupInput}
                placeholder="전화번호 입력 (선택)"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy('phone')}
                data-valid={false}
                onBlur={onPhoneBlur}
                onValueChange={(value) => onValueChange('phone', value)}
              />
            </div>
          </div>
        </div>
        <div className={recovery.passwordForm}>
          <label className={recovery.passwordLabel} htmlFor={id('password')}>
            새로운 비밀번호 설정
          </label>
          {input('password', '새 비밀번호 입력')}
          <p id={passwordHintId} className={recovery.hint}>
            *8-20자 영문 대소문자, 숫자, 특수문자 포함
          </p>
        </div>
        <div className={recovery.rows}>
          <div className={recovery.row}>
            <label htmlFor={id('code')}>
              E- mail
              <br />
              인증 번호
            </label>
            {input('code', '인증번호 입력')}
          </div>
          <div className={recovery.row}>
            <label htmlFor={id('loginId')}>아이디</label>
            {input('loginId', '아이디 입력')}
          </div>
        </div>
      </div>
      {Object.values(errors).some(Boolean) && (
        <div className={entry.authFeedback} data-auth-feedback>
          {(['phone', 'password', 'code', 'loginId'] as const).map((field) =>
            errors[field] ? (
              <div key={field} className={entry.feedbackEntry} data-feedback-tone="error">
                <p className={entry.feedbackMessage} role="alert" aria-atomic="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 9v4" />
                    <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                    <path d="M12 16h.01" />
                  </svg>
                  <span id={errorId(field)}>{errors[field]}</span>
                </p>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}
