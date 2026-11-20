import type { Assignment, MonitorSnapshot, Stage, Task } from '@/components/project/demos/agentflow/shared/api/contract';

/** 탐색 경로. 값은 모두 기록의 ID이며 인덱스를 쓰지 않아 1초 갱신 중에도 선택이 유지된다. */
export interface Path { stageId: string | null; taskId: string | null; attemptId: string | null }
export type Depth = 1 | 2 | 3 | 4;
export type FlowTab = 'flow' | 'time' | 'requirements' | 'events' | 'records';

export const emptyPath: Path = { stageId: null, taskId: null, attemptId: null };
export const flowTabs: { id: FlowTab; label: string }[] = [
  { id: 'flow', label: '흐름' }, { id: 'time', label: '시간' }, { id: 'requirements', label: '요구사항' },
  { id: 'events', label: '사건 기록' }, { id: 'records', label: '원본 기록' },
];

/** 진행 관리(orchestration)는 단계 흐름이 아니라 Master 레인에서 보여 주므로 단계 목록에서 제외한다. */
export function visibleStages(snapshot: MonitorSnapshot): Stage[] {
  return snapshot.stages.filter(stage => stage.id !== 'orchestration');
}

export function depthOf(path: Path): Depth {
  return path.attemptId ? 4 : path.taskId ? 3 : path.stageId ? 2 : 1;
}

export function tasksOfStage(snapshot: MonitorSnapshot, stageId: string): Task[] {
  return snapshot.tasks.filter(task => task.stage === stageId);
}

/** 검토 회차가 아닌 실행만 "시도"로 센다. 두 종류의 번호는 각각 1부터 시작한다. */
export function attemptOrdinal(task: Task, attempt: Assignment): number {
  const reviewer = attempt.role === 'reviewer';
  const index = task.attempts.findIndex(item => item.id === attempt.id);
  return task.attempts.slice(0, index + 1).filter(item => (item.role === 'reviewer') === reviewer).length;
}

export function attemptLabel(task: Task, attempt: Assignment): string {
  return `${attempt.role === 'reviewer' ? '검토' : '시도'} ${attemptOrdinal(task, attempt)}`;
}

/** 존재하지 않게 된 ID 이후의 경로를 잘라, 갱신으로 기록이 바뀌어도 화면이 빈 선택을 가리키지 않게 한다. */
export function resolvePath(snapshot: MonitorSnapshot | null, path: Path): Path {
  if (!snapshot) return emptyPath;
  const stage = visibleStages(snapshot).find(item => item.id === path.stageId);
  if (!stage) return emptyPath;
  const task = tasksOfStage(snapshot, stage.id).find(item => item.id === path.taskId);
  if (!task) return { stageId: stage.id, taskId: null, attemptId: null };
  const attempt = task.attempts.find(item => item.id === path.attemptId);
  return { stageId: stage.id, taskId: task.id, attemptId: attempt?.id ?? null };
}

/** Master가 가리키는 대상을 하나로 특정되는 가장 깊은 곳까지 따라간다. 병렬 실행처럼 작업이 여럿이면 단계에서 멈춘다. */
export function followPath(snapshot: MonitorSnapshot | null): Path {
  if (!snapshot) return emptyPath;
  const { focus } = snapshot;
  const stageId = focus.stage && visibleStages(snapshot).some(stage => stage.id === focus.stage) ? focus.stage : null;
  if (!stageId) return emptyPath;
  const task = focus.taskId ? tasksOfStage(snapshot, stageId).find(item => item.id === focus.taskId) : undefined;
  if (!task) return { stageId, taskId: null, attemptId: null };
  const wanted = focus.assignmentIds.length === 1 ? focus.assignmentIds[0] : null;
  const attempt = wanted ? task.attempts.find(item => item.assignmentId === wanted) : undefined;
  return { stageId, taskId: task.id, attemptId: attempt?.id ?? null };
}

export interface Crumb { key: string; label: string; depth: number; path: Path }

/** 브레드크럼은 현재 경로에서 계산하며 각 구간은 해당 깊이로 올라가는 경로를 가진다. */
export function breadcrumbs(snapshot: MonitorSnapshot | null, path: Path): Crumb[] {
  const crumbs: Crumb[] = [{ key: 'run', label: snapshot?.run.title || '실행', depth: 1, path: emptyPath }];
  if (!snapshot) return crumbs;
  const resolved = resolvePath(snapshot, path);
  const stage = snapshot.stages.find(item => item.id === resolved.stageId);
  if (!stage) return crumbs;
  crumbs.push({ key: `stage:${stage.id}`, label: stage.label, depth: 2, path: { stageId: stage.id, taskId: null, attemptId: null } });
  const task = snapshot.tasks.find(item => item.id === resolved.taskId);
  if (!task) return crumbs;
  crumbs.push({ key: `task:${task.id}`, label: task.title, depth: 3, path: { stageId: stage.id, taskId: task.id, attemptId: null } });
  const attempt = task.attempts.find(item => item.id === resolved.attemptId);
  if (attempt) crumbs.push({ key: `attempt:${attempt.id}`, label: attemptLabel(task, attempt), depth: 4, path: resolved });
  return crumbs;
}

/** 한 단계 위 경로. 가장 위 깊이에서는 그대로 돌려준다. */
export function parentPath(path: Path): Path {
  if (path.attemptId) return { ...path, attemptId: null };
  if (path.taskId) return { ...path, taskId: null };
  return emptyPath;
}
