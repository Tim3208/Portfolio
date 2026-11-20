/** 모니터 조회 전용 응답 계약. 과거 기록의 누락값은 null 또는 빈 목록으로 유지한다. */
export interface RunSummary {
  id: string;
  runId: string;
  projectId?: string | null;
  projectName?: string | null;
  title: string;
  phase: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  endedAt?: string | null;
  runDir?: string;
  lastEventAt?: string | null;
  active: boolean;
  readOnly?: boolean;
  tracking?: 'tracked' | 'legacy-untracked';
}

export interface Stage {
  id: string;
  label: string;
  status: string;
  elapsedMs: number | null;
  taskIds: string[];
  /** 해당 단계 사건·배정에서 기록된 첫 시각. 기록이 없으면 null. */
  startedAt: string | null;
  /** 완료된 단계의 마지막 기록 시각. 진행 중이거나 미기록이면 null. */
  endedAt: string | null;
}

export interface Activity {
  id: string;
  assignmentId?: string | null;
  taskId?: string | null;
  stage?: string | null;
  provider?: string | null;
  actor?: string | null;
  role?: string | null;
  title: string;
  kind?: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  elapsedMs?: number | null;
  purpose?: string | null;
  input?: string | null;
  output?: string | null;
  rawRefs?: string[];
  [key: string]: unknown;
}

/** 요청한 설정. explicit이면 value가 있고 inherit·default이면 null이다. */
export interface RequestedSetting { mode: 'explicit' | 'inherit' | 'default'; value: string | null }
/** 실행 중 관측한 설정. 알 수 없으면 status가 unknown이고 이유가 reason에 있다. */
export interface ObservedSetting { status: 'known' | 'unknown'; value: string | null; reason?: string }

/** 에이전트 한 번의 실행 배정(회차). 요청한 모델과 실제 관측 값은 그대로 보존한다. */
export interface Assignment extends Activity {
  assignmentId: string;
  role: string;
  assignedAt?: string | null;
  relationship?: string | null;
  previousAssignmentId?: string | null;
  outcome?: string | null;
  requested?: { model: RequestedSetting; effort: RequestedSetting } | null;
  observed?: { model: ObservedSetting; effort: ObservedSetting; usageModels?: { value: string }[] } | null;
}

export interface Review {
  id: string;
  stage: string;
  targetId: string | null;
  verdict: string | null;
  summary: string | null;
  at: string | null;
  findings: { topic: string | null; detail: string | null }[];
  rawRefs: string[];
}

export interface Task {
  id: string;
  title: string;
  stage: string;
  status: string;
  purpose?: string | null;
  requirementIds: string[];
  requirements: { id: string; description: string }[];
  elapsedMs?: number | null;
  attemptCount: number;
  reviewCount: number;
  retryCount: number;
  attempts: Assignment[];
  reviews: Review[];
  sourceRefs: string[];
  acceptance?: string | null;
  cases?: { todoId?: string; verdict?: string; [key: string]: unknown }[];
}

export type EventCategory = 'decision' | 'agent' | 'review' | 'question' | 'wait' | 'qa' | 'wiki' | 'system';

export interface TimelineEvent {
  id: string;
  type: string;
  at: string | null;
  title: string;
  taskId?: string | null;
  stage?: string | null;
  rawRefs: string[];
  category: EventCategory;
  summary?: string | null;
  verdict?: string | null;
}

export type FocusKind =
  | 'done' | 'ended' | 'waiting-user' | 'waiting-quota' | 'master-decision' | 'blocked'
  | 'agent-running' | 'review-running' | 'review-queued' | 'waiting-qa-scope' | 'finishing' | 'dispatching';

/** Master가 지금 기다리거나 지시하는 대상. 기록된 상태에서만 판정하며 내부 판단 과정은 포함하지 않는다. */
export interface Focus {
  kind: FocusKind;
  sentence: string;
  stage: string | null;
  taskId: string | null;
  taskIds?: (string | null)[];
  role: string | null;
  assignmentIds: string[];
  since: string | null;
  elapsedMs: number | null;
  lastEvent: { type: string; title: string; at: string | null } | null;
  pendingQuestions?: number;
  quiet: boolean;
  quietMs: number | null;
  quietAfterMs: number;
  basis: 'recorded-state';
}

export interface Wait {
  id: string;
  status: string;
  reason: string | null;
  stage: string | null;
  taskId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  open: boolean;
  elapsedMs: number | null;
}

export interface Requirement {
  id: string;
  description: string;
  acceptance: string | null;
  taskIds: string[];
}

export interface RepeatTopic { total?: number; epoch?: number; epochCount?: number }

export interface MonitorSnapshot {
  version: number;
  run: RunSummary;
  stages: Stage[];
  tasks: Task[];
  activities: Activity[];
  assignments: Assignment[];
  timeline: TimelineEvent[];
  waiting: { status?: string; reason: string; startedAt?: string | null; elapsedMs?: number | null } | null;
  waits: Wait[];
  requirements: Requirement[];
  focus: Focus;
  metrics: {
    elapsedMs: number | null; observedElapsedMs?: number | null; waitingMs: number | null; attemptCount: number; reviewCount: number;
    repeatTopics: Record<string, RepeatTopic>; qaFailureCounts: Record<string, unknown>;
  };
  warnings: string[];
  revision: string;
  generatedAt: string;
  lastRecordAt: string | null;
  currentStage: string;
  hasOlderTimeline: boolean;
  totals: { events: number; activities: number; tasks: number };
}

export interface Discovery {
  version: number;
  runs: RunSummary[];
  currentRunId: string | null;
  issues: (string | { code: string; message: string; projectId?: string; runId?: string })[];
}

export interface RawRecord {
  ref: string;
  text: string;
  offset: number;
  nextOffset: number | null;
  totalBytes: number;
  truncated: boolean;
}

export interface RecordEntry {
  ref: string;
  name: string;
  kind: 'directory' | 'file';
  size?: number;
  modifiedAt?: string | null;
}

export interface RecordsResult {
  prefix: string;
  entries: RecordEntry[];
  nextCursor: string | null;
  total?: number;
}

export type MonitorRequest =
  | { action: 'discover'; configPath?: string }
  | { action: 'snapshot'; runId: string }
  | { action: 'records'; runId: string; prefix: string; cursor?: string; limit?: number; query?: string }
  | { action: 'record'; runId: string; ref: string; offset?: number; limit?: number };
