"use client";

import { useState } from "react";

import { RadioChoices } from "@/components/ui/Switcher";

import { MonitorPage } from "./agentflow/pages/monitor/MonitorPage";
import { DeferredDemoFrame } from "./shell/DeferredDemoFrame";
import { DemoLayout } from "./shell/DemoLayout";
import { DemoPanel } from "./shell/DemoPanel";
import styles from "./MonitorScreenDemo.module.css";

type Scenario = "live" | "done";

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "live", label: "진행 중 · 독립 QA 재검증" },
  { value: "done", label: "완료 · 전체 승인 통과" },
];

/**
 * AgentFlow Monitor 실제 화면 데모 조작부.
 * 시나리오 전환과 초기화만 화면 밖 패널에 두고, 흐름 → 단계 → 작업 → 회차 탐색과
 * 원문 시트 열기는 원본 앱 화면 안에서 그대로 실행한다.
 */
export function MonitorScreenControls() {
  const [scenario, setScenario] = useState<Scenario>("live");
  const [resetCount, setResetCount] = useState(0);

  return (
    <DemoLayout variant="wide">
      <div className="min-w-0">
        <DeferredDemoFrame
          variant="wide"
          designWidth={1200}
          designHeight={740}
          scaleAtAllWidths
          resetKey={`${scenario}:${resetCount}`}
          label="AgentFlow Monitor 실제 화면"
          className={styles.frame}
          placeholder={<div className={styles.placeholder} aria-hidden="true" />}
        >
          <MonitorPage key={`${scenario}:${resetCount}`} scenario={scenario} />
        </DeferredDemoFrame>
        <p className="mt-2 text-sm text-ink-2 lg:hidden">
          넓은 화면에서는 단계 · 작업 · 회차와 원문 기록 시트를 직접 눌러 탐색할 수 있습니다.
        </p>
      </div>
      <DemoPanel
        label="실행 시나리오"
        intro={
          <>
            <p className="font-semibold">실행 시나리오</p>
            <p className="text-sm text-ink-2">
              단계나 작업을 눌러 한 깊이씩 들어가 보세요. 원문 기록을 누르면 오른쪽 시트가 열리고, 상단 지금 줄은 항상 고정됩니다.
            </p>
          </>
        }
        controls={
          <div className={styles.controls}>
            <RadioChoices
              name="monitor-scenario"
              legend="실행 시나리오 고르기"
              value={scenario}
              options={SCENARIOS}
              onValueChange={(next) => setScenario(next as Scenario)}
            />
            <button
              type="button"
              className={styles.reset}
              onClick={() => {
                setScenario("live");
                setResetCount((n) => n + 1);
              }}
            >
              처음으로
            </button>
          </div>
        }
      />
    </DemoLayout>
  );
}
