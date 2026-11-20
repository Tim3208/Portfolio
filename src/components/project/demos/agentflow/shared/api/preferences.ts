/**
 * 원본: Tim3208/agentflow-skills @ 3eb3c16 (apps/agentflow-monitor/src/shared/api/preferences.ts)
 * 변경점: 포트폴리오 방문자의 localStorage 를 건드리지 않도록 메모리 저장소를 쓴다.
 */
const memory = new Map<string, unknown>();

export function readPreference<T>(key: string, fallback: T): T {
  return memory.has(key) ? (memory.get(key) as T) : fallback;
}

export function writePreference(key: string, value: unknown): void {
  memory.set(key, value);
}
