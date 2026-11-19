"use client";

import { useId, useReducer } from "react";

import { RadioChoices } from "@/components/ui/Switcher";

import { StampsScreen } from "./make-a-wish/components/StampsScreen";
import { demoReducer, initialDemoState, makeResponse, SAMPLE_BOOTHS, SCENARIOS } from "./make-a-wish/demo";
import { DeferredDemoFrame } from "./shell/DeferredDemoFrame";
import { DemoLayout } from "./shell/DemoLayout";
import { DemoPanel } from "./shell/DemoPanel";
import styles from "./StampBoardDemo.module.css";

/** 원본 서비스 화면에 샘플 JSON을 공급한다. 적립 조작은 서비스 밖 패널에만 둔다. */
export function StampBoardControls() {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialDemoState);
  const scenarioId = useId();

  return (
    <DemoLayout>
      <DeferredDemoFrame
        className={styles.frame}
        placeholder={<div className={styles.placeholder} aria-hidden="true" />}
      >
        <StampsScreen
          key={state.visit}
          slots={state.screen.slots}
          error={state.screen.error}
          retry={() => dispatch({ type: "retry" })}
        />
      </DeferredDemoFrame>
      <DemoPanel
        label="서버 응답"
        intro={
          <>
            <p className="font-semibold">서버 응답</p>
            <p className="text-sm text-ink-2">
              부스에서 QR을 찍으면 서버가 스탬프를 지급합니다. 그 응답을 여기서 바꿔 봅니다.
            </p>
          </>
        }
        controls={
          <>
            <fieldset className="min-w-0">
              <legend className="sr-only mb-1 text-xs text-ink-2 md:not-sr-only">부스별 지급</legend>
              <div className={styles.grants}>
                {SAMPLE_BOOTHS.map((booth) => (
                  <label key={booth.id} className="relative flex min-h-11 cursor-pointer items-center gap-2 rounded-xs border border-rule text-sm has-checked:border-hue-deep has-checked:bg-hue-tint has-checked:font-semibold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-hue-deep">
                    <input
                      type="checkbox"
                      aria-label={`${booth.name}${booth.category === "EXTERNAL" ? " · 외부" : ""}`}
                      checked={state.grants.some(({ boothId }) => boothId === booth.id)}
                      onChange={() => dispatch({ type: "toggle", boothId: booth.id })}
                      className="sr-only accent-hue-deep md:not-sr-only"
                    />
                    <span aria-hidden="true" className="flex items-center gap-0.5 md:hidden">
                      {String.fromCharCode(64 + booth.id)}
                      {booth.category === "EXTERNAL" ? <span className="text-[0.5625rem]">외부</span> : null}
                    </span>
                    <span aria-hidden="true" className="hidden md:inline">
                      {booth.name}{booth.category === "EXTERNAL" ? " · 외부" : ""}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className={styles.scenarios}>
              <p className="hidden text-xs text-ink-2 md:block" aria-hidden="true">상황</p>
              <RadioChoices
                name={scenarioId}
                legend="서버 응답 상황"
                options={SCENARIOS}
                value={state.scenario}
                onValueChange={(value) => dispatch({ type: "scenario", value })}
                compactDesktop={false}
              />
            </div>
            <div className={styles.refreshRow}>
              <p role="status" className="text-xs text-ink-2">
                {state.screen.autoRefresh ? "자동 갱신 중" : "자동 갱신 멈춤"}
                <span className="sr-only md:not-sr-only">
                  {state.screen.autoRefresh
                    ? " · 응답을 바꾸면 바로 반영합니다."
                    : " · 다시 시도하거나 화면을 새로 여세요."}
                </span>
              </p>
              <button
                type="button"
                onClick={() => dispatch({ type: "reopen" })}
                className="min-h-11 shrink-0 rounded-xs border border-rule-strong px-2 text-sm hover:border-hue-deep hover:text-hue-deep"
              >
                화면 새로 열기
              </button>
            </div>
          </>
        }
        response={
          <>
            <summary className="min-h-11 cursor-pointer py-2.5 text-sm">응답 보기</summary>
            <pre className="max-h-48 overflow-auto bg-paper-sunk p-3 font-mono text-xs" tabIndex={0} aria-label="샘플 서버 응답 JSON">
              {JSON.stringify(makeResponse(state), null, 2)}
            </pre>
          </>
        }
      />
    </DemoLayout>
  );
}
