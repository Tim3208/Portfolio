"use client";

import { useId, useState } from "react";
import "@fontsource-variable/hahmlet";

import { RadioChoices } from "@/components/ui/Switcher";

import { InputFields, type InputQaErrors, type InputQaValues } from "./make-a-wish/input-qa/InputFields";
import { LoginWelcome } from "./make-a-wish/input-qa/LoginWelcome";
import { resolveLoginWelcome } from "./make-a-wish/input-qa/resolveLoginWelcome";
import { validateRecoveryCode, validateRecoveryId } from "./make-a-wish/input-qa/recoveryValidation";
import { formatSignupPhoneInput } from "./make-a-wish/input-qa/signupInputFormatting";
import { validateOptionalInfo, validateSignupPassword } from "./make-a-wish/input-qa/signupValidation";
import service from "./make-a-wish/service.module.css";
import { DeferredDemoFrame } from "./shell/DeferredDemoFrame";
import { DemoLayout } from "./shell/DemoLayout";
import { DemoPanel } from "./shell/DemoPanel";
import styles from "./InputQaDemo.module.css";

const NAME_EXAMPLES = [
  { label: "<img src=x onerror=alert(1)>", value: "<img src=x onerror=alert(1)>" },
  { label: "<b>굵게</b>", value: "<b>굵게</b>" },
  { label: "공백만 · ␣␣␣", value: "   " },
  { label: "아주 긴 이름 · 200자", value: "이름".repeat(100) },
] as const;

const FIELD_EXAMPLES: { field: keyof InputQaValues; label: string; value: string }[] = [
  { field: "phone", label: "전화번호 · 010-12-34", value: "010-12-34" },
  { field: "phone", label: "전화번호 · abc0101234", value: "abc0101234" },
  { field: "password", label: "비밀번호 · password1!", value: "password1!" },
  { field: "password", label: "비밀번호 · Passw0rd!", value: "Passw0rd!" },
  { field: "code", label: "인증번호 · １２３４５６", value: "１２３４５６" },
  { field: "code", label: "인증번호 · 12345", value: "12345" },
  { field: "code", label: "인증번호 · 123456", value: "123456" },
  { field: "loginId", label: "아이디 · 공백만", value: "   " },
  { field: "loginId", label: "아이디 · 100자", value: "a".repeat(100) },
  { field: "loginId", label: "아이디 · 101자", value: "a".repeat(101) },
];

function validate(field: keyof InputQaValues, value: string) {
  switch (field) {
    case "phone": return validateOptionalInfo({ phone: value, grade: "", enrollment: "", birthDate: "" }).phone;
    case "password": return validateSignupPassword(value);
    case "code": return validateRecoveryCode(value);
    case "loginId": return validateRecoveryId(value);
  }
}

/** 샘플 값과 확인 조작은 서비스 밖에 두고 원본 함수에 그대로 전달한다. */
export function InputQaControls() {
  const id = useId();
  const [view, setView] = useState("welcome");
  const [name, setName] = useState<string>(NAME_EXAMPLES[0].value);
  const [fee, setFee] = useState("boolean");
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [visit, setVisit] = useState(0);
  const [values, setValues] = useState<InputQaValues>({
    phone: "010-1234-5678", password: "Passw0rd!", code: "123456", loginId: "wish-user",
  });
  const [errors, setErrors] = useState<InputQaErrors>({});
  const [checkMessage, setCheckMessage] = useState("");
  const profile = {
    name,
    ...(fee === "missing" ? {} : { studentFeePaid: fee === "boolean" ? true : fee === "string" ? "true" : null }),
  };
  const invitation = resolveLoginWelcome({
    status: "authenticated", sessionVersion: 1, pendingWelcomeSession: 1,
    profileSessionVersion: 1, isSuccess: true, profile,
  });

  const reopen = () => {
    setWelcomeOpen(true);
    setVisit((previous) => previous + 1);
  };

  // 복구 원본은 입력을 바꾸면 복구 오류를 모두 지우고, 전화번호는 별도 가입 입력이다.
  const changeInput = (field: keyof InputQaValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => field === "phone"
      ? { ...previous, phone: undefined }
      : { phone: previous.phone });
    setCheckMessage("");
  };

  const tryExample = ({ field, value }: typeof FIELD_EXAMPLES[number]) => {
    const next = field === "phone" ? formatSignupPhoneInput(value) : value;
    const error = validate(field, next);
    changeInput(field, next);
    setErrors((previous) => ({ ...previous, [field]: error }));
    setCheckMessage(error ? "예시 값을 확인했습니다. 입력란의 오류 문구를 확인해 보세요." : "예시 값이 원본 입력 규칙을 통과했습니다.");
  };

  return (
    <DemoLayout>
      <DeferredDemoFrame
        className={styles.frame}
        placeholder={<div className={styles.placeholder} aria-hidden="true" />}
      >
        <div className={`${service.service} ${styles.screen}`}>
          {view === "welcome" ? welcomeOpen && invitation ? (
            <LoginWelcome key={visit} invitation={invitation} onDismiss={() => setWelcomeOpen(false)} />
          ) : (
            <p role="status" className={styles.closed}>환영창을 닫았습니다.</p>
          ) : (
            <div className={styles.fields}>
              <InputFields
                values={values}
                errors={errors}
                onValueChange={changeInput}
                onPhoneBlur={() => setErrors((previous) => ({ ...previous, phone: validate("phone", values.phone) }))}
              />
            </div>
          )}
        </div>
      </DeferredDemoFrame>
      <DemoPanel
        label="넣어 볼 값"
        intro={
          <>
            <p className="font-semibold">넣어 볼 값</p>
            <p className="text-sm text-ink-2">축제 전에 일부러 넣어 본 값들입니다. 직접 바꿔 보세요.</p>
          </>
        }
        controls={
          <>
            <RadioChoices
              name={`${id}-view`}
              legend="서비스 화면 보기"
              options={[{ label: "환영창", value: "welcome" }, { label: "입력란", value: "fields" }]}
              value={view}
              onValueChange={setView}
              compactDesktop={false}
            />
            <fieldset className="min-w-0">
              <legend className="sr-only">{view === "welcome" ? "이름 예시" : "입력란 예시 · 값을 넣고 확인합니다"}</legend>
              <div className={styles.examples}>
                {view === "welcome" ? NAME_EXAMPLES.map((example) => (
                  <button key={example.label} type="button" className={styles.example} onClick={() => { setName(example.value); reopen(); }}>
                    {example.label}
                  </button>
                )) : (
                  <>
                    {FIELD_EXAMPLES.map((example) => (
                      <button key={example.label} type="button" className={styles.example} onClick={() => tryExample(example)}>
                        {example.label}
                      </button>
                    ))}
                    <button type="button" className={styles.example} onClick={() => {
                      const nextErrors = Object.fromEntries(Object.entries(values).map(([field, value]) => [field, validate(field as keyof InputQaValues, value)]));
                      setErrors(nextErrors);
                      setCheckMessage(Object.values(nextErrors).some(Boolean) ? "입력값을 확인했습니다. 입력란의 오류 문구를 확인해 보세요." : "입력값 네 개가 원본 입력 규칙을 통과했습니다.");
                    }}>입력값 확인</button>
                  </>
                )}
              </div>
            </fieldset>
          </>
        }
        body={view === "welcome" ? (
          <div className={styles.profile}>
            <label htmlFor={`${id}-name`} className="flex min-w-0 flex-col gap-1 text-sm">
              이름
              <input id={`${id}-name`} className={styles.name} value={name} autoComplete="off" onChange={(event) => { setName(event.currentTarget.value); reopen(); }} />
            </label>
            <fieldset className="min-w-0">
              <legend className="mb-1 text-sm">학생회비 납부 값</legend>
              <RadioChoices
                name={`${id}-fee`}
                legend="학생회비 납부 응답 값"
                options={[{ label: "true", value: "boolean" }, { label: '"true" (문자열)', value: "string" }, { label: "null", value: "null" }, { label: "없음", value: "missing" }]}
                value={fee}
                onValueChange={(value) => { setFee(value); reopen(); }}
                compactDesktop={false}
              />
            </fieldset>
            <button type="button" className="min-h-11 self-start rounded-xs border border-rule-strong px-3 text-sm hover:border-hue-deep hover:text-hue-deep" onClick={reopen}>
              환영창 다시 열기
            </button>
          </div>
        ) : (
          <div className={styles.profile}>
            <p className="text-sm text-ink-2">예시는 값을 넣고 확인합니다. 직접 입력한 뒤에는 ‘입력값 확인’을 누르세요. 전화번호는 입력란을 벗어날 때도 확인합니다.</p>
            <p role="status" className="text-sm text-ink-2">{checkMessage}</p>
          </div>
        )}
        response={view === "welcome" ? (
          <>
            <summary className="min-h-11 cursor-pointer py-2.5 text-sm">응답 보기</summary>
            <pre className="max-h-48 overflow-auto bg-paper-sunk p-3 font-mono text-xs" tabIndex={0} aria-label="샘플 프로필 응답 JSON">{JSON.stringify(profile, null, 2)}</pre>
          </>
        ) : undefined}
      />
    </DemoLayout>
  );
}
