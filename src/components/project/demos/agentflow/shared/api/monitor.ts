/**
 * 원본: Tim3208/agentflow-skills @ 3eb3c16 (apps/agentflow-monitor/src/shared/api/monitor.ts)
 * 변경점: Tauri invoke · 개발 브리지 대신 메모리 샘플 실행 데이터를 돌려준다.
 */
import type { MonitorRequest } from "./contract";
import { SAMPLE_DISCOVERY, SAMPLE_SNAPSHOTS, sampleRecord, sampleRecords } from "../../fixture";

export async function requestMonitor<T>(request: MonitorRequest): Promise<T> {
  switch (request.action) {
    case "discover":
      return SAMPLE_DISCOVERY as T;
    case "snapshot": {
      const snapshot = SAMPLE_SNAPSHOTS[request.runId];
      if (!snapshot) throw new Error("샘플 실행 기록을 찾지 못했습니다.");
      return snapshot as T;
    }
    case "records":
      return sampleRecords(request.runId, request.prefix) as T;
    case "record":
      return sampleRecord(request.ref) as T;
  }
}
