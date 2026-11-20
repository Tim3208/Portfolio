import type { Assignment, EventCategory, MonitorSnapshot, Requirement, Review, Task, TimelineEvent, Wait } from '@/components/project/demos/agentflow/shared/api/contract';
import type { Axis, Segment, SegmentTone, Tick } from '@/components/project/demos/agentflow/shared/lib/timeline';
import { attemptLabel, type Path } from './path';

const parse = (value?: string | null): number | null => {
  const time = value ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? time : null;
};

/** 시각이 기록되지 않았으면 null을 돌려준다. 추정하거나 0으로 바꾸지 않는다. */
export function elapsedSince(value: string | null | undefined, nowMs: number): number | null {
  const start = parse(value);
  return start === null ? null : Math.max(0, nowMs - start);
}

/* ───────────── 시간 축과 레인 ───────────── */

export type WindowKey = 'all' | '30m' | '10m';
export const windowOptions: { id: WindowKey; label: string; ms: number | null }[] = [
  { id: 'all', label: '전체', ms: null }, { id: '30m', label: '최근 30분', ms: 30 * 60_000 }, { id: '10m', label: '최근 10분', ms: 10 * 60_000 },
];

/** 보기 범위. 진행 중이면 현재 시각, 끝난 실행이면 종료(없으면 마지막 기록) 시각까지다. 시작이 미기록이면 가장 이른 기록에서 시작한다. */
export function timeAxis(snapshot: MonitorSnapshot, windowKey: WindowKey, nowMs: number): Axis | null {
  const { run } = snapshot;
  const moments = [...snapshot.assignments.map(item => parse(item.startedAt)), ...snapshot.timeline.map(event => parse(event.at))].filter((value): value is number => value !== null);
  const first = parse(run.createdAt) ?? (moments.length ? Math.min(...moments) : null);
  const end = run.active ? nowMs : parse(run.endedAt) ?? parse(snapshot.lastRecordAt) ?? (moments.length ? Math.max(...moments) : null);
  if (first === null || end === null || end <= first) return null;
  const limit = windowOptions.find(item => item.id === windowKey)?.ms ?? null;
  return { start: limit === null ? first : Math.max(first, end - limit), end };
}

export interface Lane { id: string; label: string; rows: Segment<Path>[][]; waits: Segment<Path>[]; ticks: Tick<Path>[] }

const laneRoles: { id: string; label: string }[] = [
  { id: 'master', label: 'Master' }, { id: 'planner', label: '기획' }, { id: 'developer', label: '개발' },
  { id: 'reviewer', label: '검토' }, { id: 'qa', label: '검증' }, { id: 'wiki', label: '문서' },
];

function assignmentTone(item: Assignment): SegmentTone {
  const status = item.status.toUpperCase();
  if (status === 'STARTED') return 'live';
  if (status === 'COMPLETED') return 'good';
  if (status === 'UNFINISHED' || status === 'SELECTED') return 'unknown';
  return 'bad';
}

/** 겹치는 구간은 아래 줄로 내려 병렬 실행이 서로 가리지 않게 한다. 진행 중 구간은 끝이 없는 것으로 본다. */
export function packRows<T>(segments: Segment<T>[]): Segment<T>[][] {
  const rows: Segment<T>[][] = [];
  for (const segment of [...segments].sort((a, b) => a.start - b.start)) {
    const row = rows.find(items => (items.at(-1)?.end ?? Infinity) <= segment.start);
    if (row) row.push(segment); else rows.push([segment]);
  }
  return rows;
}

const tickTone = (verdict?: string | null): Tick['tone'] => {
  const value = verdict?.toUpperCase();
  return value === 'PASS' ? 'good' : value === 'FAIL' || value === 'BLOCKED' ? 'bad' : 'neutral';
};

/** 배정이 화면에서 열 수 있는 회차인지 확인하고 그 경로를 돌려준다. 단계 목록에 없는 진행 관리 배정은 null이다. */
export function assignmentPath(snapshot: MonitorSnapshot, item: Assignment): Path | null {
  const task = snapshot.tasks.find(candidate => candidate.id === item.taskId);
  const stage = snapshot.stages.find(candidate => candidate.id === item.stage);
  return task && stage && stage.id !== 'orchestration' && task.attempts.some(attempt => attempt.id === item.id) ? { stageId: stage.id, taskId: task.id, attemptId: item.id } : null;
}

/** 조건에 맞는 배정을 시간 막대 구간으로 바꾼다. 시작 시각이 기록되지 않은 배정은 위치를 알 수 없으므로 그리지 않는다. */
export function assignmentSegments(snapshot: MonitorSnapshot, include: (item: Assignment) => boolean, display = (source: string) => source): Segment<Path>[] {
  const taskById = new Map(snapshot.tasks.map(task => [task.id, task]));
  const labelOf = (item: Assignment): string => {
    const task = item.taskId ? taskById.get(item.taskId) : undefined;
    const base = task ? attemptLabel(task, item) : item.role === 'master' ? '진행 관리' : item.role;
    return task && item.role !== 'master' ? `${base} · ${display(task.title)}` : base;
  };
  return snapshot.assignments.filter(include).flatMap((item): Segment<Path>[] => {
    const start = parse(item.startedAt);
    return start === null ? [] : [{ id: item.id, start, end: parse(item.endedAt), tone: assignmentTone(item), label: labelOf(item), target: assignmentPath(snapshot, item) }];
  });
}

/** 구간들이 덮는 범위. 진행 중이면 현재 시각까지, 구간이 없으면 null이다. */
export function rangeOf(segments: Segment<unknown>[], nowMs: number | null): Axis | null {
  if (!segments.length) return null;
  const start = Math.min(...segments.map(item => item.start));
  const end = Math.max(...segments.map(item => item.end ?? nowMs ?? item.start));
  return end > start ? { start, end } : { start, end: start + 1000 };
}

/** 역할별 레인. 대기 구간은 Master 레인에 빗금으로, 검토 판정은 검토 레인에 눈금으로 둔다. 시작 시각이 없는 배정은 그리지 않는다. */
export function buildLanes(snapshot: MonitorSnapshot, display = (source: string) => source): Lane[] {
  const lanes = laneRoles.map(({ id, label }): Lane => ({ id, label, rows: packRows(assignmentSegments(snapshot, item => item.role === id, display)), waits: [], ticks: [] }));
  const byId = new Map(lanes.map(lane => [lane.id, lane]));
  const master = byId.get('master')!;
  master.waits = snapshot.waits.flatMap((wait): Segment<Path>[] => {
    const start = parse(wait.startedAt);
    return start === null ? [] : [{ id: wait.id, start, end: parse(wait.endedAt), tone: 'wait', label: display(waitLabel(wait)), target: null }];
  });
  for (const event of snapshot.timeline) {
    const at = parse(event.at);
    if (at === null) continue;
    const lane = event.category === 'review' ? byId.get('reviewer') : ['decision', 'question', 'wait'].includes(event.category) ? master : null;
    lane?.ticks.push({ id: event.id, at, tone: tickTone(event.verdict), label: display(event.title), target: null });
  }
  return lanes.filter(lane => lane.id === 'master' || lane.rows.length || lane.ticks.length);
}

export type ChainItem = { type: 'attempt'; attempt: Assignment } | { type: 'review'; review: Review };

/**
 * 작업의 진행 순서. 실행·검토 회차를 기록 순서대로 두고, 검토 판정은 판정 시각 이전에 끝난 마지막 회차 뒤에 끼운다.
 * 판정 시각이 없으면 위치를 추정하지 않고 체인 끝에 둔다.
 */
export function taskChain(task: Task): ChainItem[] {
  const after = new Map<number, Review[]>();
  for (const review of task.reviews) {
    const at = parse(review.at);
    let index = task.attempts.length - 1;
    if (at !== null) {
      index = -1;
      task.attempts.forEach((attempt, position) => { const done = parse(attempt.endedAt) ?? parse(attempt.startedAt); if (done !== null && done <= at) index = position; });
    }
    after.set(index, [...after.get(index) ?? [], review]);
  }
  const reviews = (index: number): ChainItem[] => (after.get(index) ?? []).map(review => ({ type: 'review', review }));
  return [...reviews(-1), ...task.attempts.flatMap((attempt, index): ChainItem[] => [{ type: 'attempt', attempt }, ...reviews(index)])];
}

export function waitLabel(wait: Wait): string {
  return wait.reason?.trim() || '대기';
}

/* ───────────── 시간 분해와 순위 ───────────── */

type Interval = [number, number];
function unionLength(intervals: Interval[]): number {
  const ordered = intervals.filter(([start, end]) => end >= start).sort((a, b) => a[0] - b[0]);
  let sum = 0, start = -Infinity, end = -Infinity;
  for (const [a, b] of ordered) {
    if (a > end) { if (end > start) sum += end - start; start = a; end = b; } else end = Math.max(end, b);
  }
  return end > start ? sum + end - start : sum;
}

export interface Breakdown { totalMs: number; agentMs: number; waitMs: number; otherMs: number }

/** 전체 경과를 에이전트 실행(병렬은 합집합), 에이전트가 없던 대기, 그 밖의 시간으로 나눈다. 전체를 알 수 없으면 null. */
export function timeBreakdown(snapshot: MonitorSnapshot, nowMs: number): Breakdown | null {
  const total = snapshot.metrics.elapsedMs;
  if (total === null) return null;
  const end = snapshot.run.active ? nowMs : parse(snapshot.run.endedAt) ?? nowMs;
  const agents = snapshot.assignments.filter(item => item.role !== 'master').flatMap((item): Interval[] => {
    const start = parse(item.startedAt);
    const finish = parse(item.endedAt) ?? (snapshot.run.active ? end : null);
    return start === null || finish === null ? [] : [[start, finish]];
  });
  const waits = snapshot.waits.flatMap((wait): Interval[] => {
    const start = parse(wait.startedAt);
    const finish = parse(wait.endedAt) ?? (wait.open && snapshot.run.active ? end : null);
    return start === null || finish === null ? [] : [[start, finish]];
  });
  const agentMs = Math.min(total, unionLength(agents));
  const covered = Math.min(total, unionLength([...agents, ...waits]));
  return { totalMs: total, agentMs, waitMs: Math.max(0, covered - agentMs), otherMs: Math.max(0, total - covered) };
}

export function slowestTasks(snapshot: MonitorSnapshot, count = 5): Task[] {
  return snapshot.tasks.filter(task => typeof task.elapsedMs === 'number').sort((a, b) => (b.elapsedMs ?? 0) - (a.elapsedMs ?? 0)).slice(0, count);
}

export function longestWaits(snapshot: MonitorSnapshot, count = 3): Wait[] {
  return snapshot.waits.filter(wait => typeof wait.elapsedMs === 'number').sort((a, b) => (b.elapsedMs ?? 0) - (a.elapsedMs ?? 0)).slice(0, count);
}

export interface RepeatWarning { topic: string; count: number; total: number | null }

/** 같은 주제가 현재 판정 구간에서 두 번 이상 지적된 경우만 나열한다. 기록된 원본 카운터를 그대로 쓴다. */
export function repeatWarnings(snapshot: MonitorSnapshot): RepeatWarning[] {
  return Object.entries(snapshot.metrics.repeatTopics ?? {}).flatMap(([topic, value]) => {
    const count = value.epochCount ?? value.total ?? 0;
    return count >= 2 ? [{ topic, count, total: value.total ?? null }] : [];
  }).sort((a, b) => b.count - a.count);
}

/* ───────────── 요구사항 ───────────── */

/** 단계 안의 작업 수와 완료 수. 작업이 없는 단계는 0/0이며 완료로 보지 않는다. */
export function stageProgress(snapshot: MonitorSnapshot, stageId: string): { done: number; total: number } {
  const tasks = snapshot.tasks.filter(task => task.stage === stageId);
  return { done: tasks.filter(task => DONE.has(task.status.toUpperCase())).length, total: tasks.length };
}

export type RequirementState = 'done' | 'failed' | 'progress' | 'unlinked';
export interface RequirementProgress { state: RequirementState; done: number; total: number; tasks: Task[] }

const DONE = new Set(['DONE', 'COMPLETE', 'COMPLETED', 'PASS', 'PASSED']);
const FAILED = new Set(['FAIL', 'FAILED', 'ERROR', 'BLOCKED', 'REJECTED']);

/** 요구사항에 연결된 작업의 상태로 충족 여부를 보여 준다. 연결된 작업이 없으면 충족으로 보지 않고 미연결로 둔다. */
export function requirementProgress(requirement: Requirement, snapshot: MonitorSnapshot): RequirementProgress {
  const tasks = requirement.taskIds.flatMap(id => snapshot.tasks.find(task => task.id === id) ?? []);
  const done = tasks.filter(task => DONE.has(task.status.toUpperCase())).length;
  const state: RequirementState = !tasks.length ? 'unlinked' : tasks.some(task => FAILED.has(task.status.toUpperCase())) ? 'failed' : done === tasks.length ? 'done' : 'progress';
  return { state, done, total: tasks.length, tasks };
}

/* ───────────── 사건 기록 ───────────── */

export const categoryLabels: Record<EventCategory, string> = {
  decision: '판단', agent: '에이전트', review: '검토', question: '질문', wait: '대기', qa: '검증', wiki: '문서', system: '시스템',
};

export interface EventFilter { categories: ReadonlySet<EventCategory>; query: string }
export interface EventGroup { stage: string | null; events: TimelineEvent[] }

/** 분류와 검색어로 거른 사건을 같은 단계가 이어지는 구간별로 묶는다. 시간순을 유지하며 단계가 없는 사건은 null 단계 묶음이 된다. */
export function groupEvents(events: TimelineEvent[], filter: EventFilter): EventGroup[] {
  const needle = filter.query.trim().toLowerCase();
  const groups: EventGroup[] = [];
  for (const event of events) {
    if (filter.categories.size && !filter.categories.has(event.category)) continue;
    if (needle && !`${event.title} ${event.summary ?? ''}`.toLowerCase().includes(needle)) continue;
    const stage = event.stage ?? null;
    const last = groups.at(-1);
    if (last && last.stage === stage) last.events.push(event); else groups.push({ stage, events: [event] });
  }
  return groups;
}
