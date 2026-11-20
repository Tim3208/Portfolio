/**
 * 원본: Tim3208/agentflow-skills @ 3eb3c16 (apps/agentflow-monitor/src/shared/lib/timeline.ts)
 * 변경점: 데모에서는 언제 열어도 같은 시간 막대가 나오도록 고정 시각(DEMO_NOW_MS)을 돌려준다.
 */
import { DEMO_NOW_MS } from "../../fixture";

export interface Axis {
  start: number;
  end: number;
}
export type SegmentTone = "live" | "good" | "bad" | "wait" | "unknown";
export interface Segment<T = unknown> {
  id: string;
  start: number;
  end: number | null;
  tone: SegmentTone;
  label: string;
  target: T | null;
}
export interface Tick<T = unknown> {
  id: string;
  at: number;
  tone: "good" | "bad" | "neutral";
  label: string;
  target: T | null;
}

export function percentOf(axis: Axis, ms: number): number {
  return Math.min(100, Math.max(0, ((ms - axis.start) / (axis.end - axis.start)) * 100));
}

export function useNow(): number {
  return DEMO_NOW_MS;
}
