/**
 * 원본: Tim3208/agentflow-skills @ 3eb3c16 (apps/agentflow-monitor/src/entities/monitor/model/useMonitor.ts)
 * 변경점: 1초/5초 폴링 대신 샘플 실행 데이터를 동기적으로 불러오고, 데모 패널의 시나리오 선택을 초기값으로 받는다.
 */
import { useCallback, useState } from "react";
import type { Discovery, MonitorSnapshot } from "@/components/project/demos/agentflow/shared/api/contract";
import { DEMO_NOW_ISO, SAMPLE_DISCOVERY, SAMPLE_SNAPSHOTS } from "../../../fixture";

export function useMonitor(scenario: "live" | "done") {
  const [view, setView] = useState<"current" | "history">(scenario === "live" ? "current" : "history");
  const [historyRunId, setHistoryRunId] = useState<string | null>(scenario === "done" ? "run-sample-done" : null);

  const discovery: Discovery = SAMPLE_DISCOVERY;
  const selectedRunId = view === "current" ? discovery.currentRunId : historyRunId;
  const snapshot: MonitorSnapshot | null = selectedRunId ? SAMPLE_SNAPSHOTS[selectedRunId] ?? null : null;

  const openCurrent = useCallback(() => setView("current"), []);
  const openHistory = useCallback((runId: string) => {
    setHistoryRunId(runId);
    setView("history");
  }, []);
  const refresh = useCallback(() => {}, []);

  return {
    discovery,
    snapshot,
    selectedRunId,
    view,
    openCurrent,
    openHistory,
    refresh,
    error: null as string | null,
    discovering: false,
    loading: false,
    updatedAt: DEMO_NOW_ISO,
  };
}
