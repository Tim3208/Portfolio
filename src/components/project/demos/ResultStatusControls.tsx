"use client";

import { useId, useReducer } from "react";

import { RadioChoices } from "@/components/ui/Switcher";

import { DeferredDemoFrame } from "./shell/DeferredDemoFrame";
import { DemoLayout } from "./shell/DemoLayout";
import { DemoPanel } from "./shell/DemoPanel";
import ApplyCompletePage from "./syu-likelion/ApplyCompletePage";
import { demoReducer, initialDemoState, makeResponse, SCENARIOS, type Scenario } from "./syu-likelion/demo";
import { ResultStatusScreen } from "./syu-likelion/ResultStatusScreen";
import styles from "./ResultStatusDemo.module.css";

/** 샘플 응답을 바꾸는 조작은 서비스 화면 밖에 둔다. 서비스의 날짜·시간 선택은 원본이 맡는다. */
export function ResultStatusControls() {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialDemoState);
  const scenarioId = useId();
  const response = makeResponse(state);
  const { dashboard, slots } = response;

  return (
    <DemoLayout variant="wide">
      <p role="status" className="sr-only">{state.successMessage}</p>
      <DeferredDemoFrame
        variant="wide"
        designWidth={1488}
        resetKey={`${state.visit}:${Boolean(state.reservation)}`}
        label="지원 결과와 면접 예약 서비스 화면"
        className={styles.frame}
        placeholder={<div className={styles.placeholder} aria-hidden="true" />}
      >
        {state.scenario === "submitted" ? (
          <ApplyCompletePage canEdit={dashboard.myApplication?.canEdit === true} />
        ) : (
          <ResultStatusScreen
            key={state.visit}
            dashboard={dashboard}
            slots={slots}
            phaseType={dashboard.recruitment.phaseType}
            userName="홍길동"
            isReserving={false}
            reserveErrorMessage={state.errorMessage}
            reserveSuccessMessage={state.successMessage}
            onReserve={async (slotId) => { dispatch({ type: "reserve", slotId }); }}
          />
        )}
      </DeferredDemoFrame>
      <DemoPanel
        label="모집 단계와 지원 상태"
        intro={
          <>
            <p className="font-semibold">모집 단계와 지원 상태</p>
            <p className="text-sm text-ink-2">같은 결과 주소가 단계와 상태에 따라 다른 화면을 보여줍니다. 상황을 바꿔 보세요.</p>
          </>
        }
        controls={
          <>
            <div className={styles.scenarios}>
              <RadioChoices
                name={scenarioId}
                legend="모집 단계와 지원 상태"
                options={SCENARIOS}
                value={state.scenario}
                onValueChange={(value) => dispatch({ type: "scenario", value: value as Scenario })}
                compactDesktop={false}
              />
            </div>
            <fieldset className={styles.conditions}>
              <legend className="sr-only">상황에 딸린 조작</legend>
              {state.scenario === "submitted" ? (
                <label className={styles.check}>
                  <input type="checkbox" checked={state.deadlinePassed} onChange={(event) => dispatch({ type: "deadline", checked: event.target.checked })} />
                  서류 마감 지남
                </label>
              ) : state.scenario === "passed" ? (
                <>
                  <label className={styles.check}>
                    <input type="checkbox" checked={state.outsidePeriod} onChange={(event) => dispatch({ type: "period", checked: event.target.checked })} />
                    면접 선택 기간 아님
                  </label>
                  <label className={styles.check}>
                    <input type="checkbox" checked={state.takenByOther} onChange={(event) => dispatch({ type: "race", checked: event.target.checked })} />
                    다른 지원자가 먼저 예약
                  </label>
                  <button type="button" disabled={!state.reservation} onClick={() => dispatch({ type: "clear" })} className={styles.clear}>
                    예약 지우기
                  </button>
                </>
              ) : null}
            </fieldset>
          </>
        }
        response={
          <>
            <summary className="min-h-11 cursor-pointer py-2.5 text-sm">응답 보기</summary>
            <pre className="max-h-48 overflow-auto bg-paper-sunk p-3 font-mono text-xs" tabIndex={0} aria-label="샘플 대시보드와 슬롯 응답 JSON">
              {JSON.stringify(response, null, 2)}
            </pre>
          </>
        }
      />
    </DemoLayout>
  );
}
