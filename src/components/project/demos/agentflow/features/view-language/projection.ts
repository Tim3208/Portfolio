import type { MonitorSnapshot, Task, TimelineEvent } from '@/components/project/demos/agentflow/shared/api/contract';
import { roleLabel, statusLabel } from '@/components/project/demos/agentflow/shared/lib/format';
import { tasksOfStage, visibleStages, type FlowTab, type Path } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import { longestWaits, repeatWarnings, slowestTasks } from '@/components/project/demos/agentflow/entities/monitor/model/selectors';

type Text = string | null | undefined;
type ProtectedPath = { token: string; value: string };
interface TranslationSource { original: string; text: string; paths: ProtectedPath[] }
export type DisplayText = (source: string) => string;
export const originalText: DisplayText = source => source;

export interface ViewLanguageProjection {
  translations: TranslationSource[];
  translationTexts: string[];
  summaryTexts: string[];
  translationLimited: boolean;
  summaryLimited: boolean;
}

const EMPTY: ViewLanguageProjection = {
  translations: [], translationTexts: [], summaryTexts: [], translationLimited: false, summaryLimited: false,
};
const encoder = new TextEncoder();
const foreign = /[\p{Script=Latin}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}]/u;
const paths = /(?:https?|file):\/\/[^\s"'\x60<>]+|"[^"\r\n]*[\\/][^"\r\n]*"|'[^'\r\n]*[\\/][^'\r\n]*'|\x60[^\x60\r\n]*[\\/][^\x60\r\n]*\x60|(?:[A-Za-z]:[\\/]|\\\\)[^\s"'\x60<>]+|(?:[~.]\/|(?<![\p{L}\p{N}:])\/)[^\s"'\x60<>]+|[\p{L}\p{N}_@.-]+(?:[\\/][\p{L}\p{N}_@.%-]+)+/gu;

function protectPaths(original: string): TranslationSource {
  const protectedPaths: ProtectedPath[] = [];
  let index = 0;
  const text = original.replace(paths, value => {
    let token: string;
    do { token = '⟦경로' + index++ + '⟧'; } while (original.includes(token));
    protectedPaths.push({ token, value });
    return token;
  });
  return { original, text, paths: protectedPaths };
}

function withinBudget(entries: Iterable<string>, maxEntries: number, maxBytes: number) {
  const texts: string[] = [];
  let limited = false;
  let used = 0;
  for (const text of entries) {
    if (texts.length === maxEntries) { limited = true; break; }
    const bytes = encoder.encode(text).byteLength;
    if (bytes > 32000 || used + bytes > maxBytes) {
      limited = true;
      continue;
    }
    texts.push(text);
    used += bytes;
  }
  return { texts, limited };
}

const reviewProse = (task: Task): Text[] => task.reviews.flatMap(review => [
  review.summary, ...review.findings.map(finding => finding.topic),
]);
const taskProse = (task: Task): Text[] => [
  task.title, task.purpose, task.acceptance,
  ...task.requirements.map(requirement => requirement.description),
  ...reviewProse(task),
  ...(task.cases ?? []).flatMap(item => {
    const label = item.title ?? item.name;
    return typeof label === 'string' ? [label] : [];
  }),
];

function taskSummary(task: Task): Text[] {
  return [
    task.title, '작업 상태 ' + statusLabel(task.status), task.purpose, task.acceptance,
    ...task.reviews.map(review => [
      '검토 결과 ' + statusLabel(review.verdict),
      review.summary,
      ...review.findings.map(finding => finding.topic),
    ].filter(Boolean).join('\n')),
    ...task.requirements.map(requirement => requirement.description),
  ];
}

function runProse(snapshot: MonitorSnapshot, tab: FlowTab, events: readonly TimelineEvent[]): Text[] {
  if (tab === 'requirements') {
    const linked = new Set(snapshot.requirements.flatMap(requirement => requirement.taskIds));
    return [
      ...snapshot.requirements.flatMap(requirement => [requirement.description, requirement.acceptance]),
      ...snapshot.tasks.filter(task => linked.has(task.id)).map(task => task.title),
    ];
  }
  if (tab === 'events') return events.flatMap(event => [event.title, event.summary]);
  if (tab === 'time') return [
    ...slowestTasks(snapshot).map(task => task.title),
    ...longestWaits(snapshot).map(wait => wait.reason?.trim()),
    ...repeatWarnings(snapshot).map(item => item.topic),
  ];
  if (tab === 'flow') return [
    ...snapshot.tasks.map(task => task.title),
    ...snapshot.waits.map(wait => wait.reason?.trim()),
    ...snapshot.timeline.filter(event => ['decision', 'question', 'wait', 'review'].includes(event.category)).map(event => event.title),
  ];
  return [];
}

/**
 * 화면에 표시하는 문장만 명시적으로 고른다. 탐색용 형제 제목은 번역에만 쓰고,
 * 원문 참조·도구 입출력·경로·설정·시계는 요청에서 제외한다.
 */
export function projectViewLanguage(snapshot: MonitorSnapshot | null, path: Path, tab: FlowTab, events: readonly TimelineEvent[], activityPurpose?: Text): ViewLanguageProjection {
  if (!snapshot) return EMPTY;
  const stage = snapshot.stages.find(item => item.id === path.stageId);
  const task = snapshot.tasks.find(item => item.id === path.taskId);
  const attempt = task?.attempts.find(item => item.id === path.attemptId);
  const waiting = snapshot.waiting?.reason;
  const activeTaskIds = new Set(snapshot.assignments.filter(item => item.status === 'STARTED' && item.role !== 'master').map(item => item.taskId));
  const nowTaskTitles = snapshot.tasks.filter(item => activeTaskIds.has(item.id)).map(item => item.title);
  const focusStage = snapshot.stages.find(item => item.id === snapshot.focus.stage);
  const nav: Text[] = [snapshot.run.title, stage?.label, focusStage?.label, snapshot.focus.sentence, waiting, ...nowTaskTitles];
  let focused: Text[];
  let summary: Text[];

  if (attempt && task) {
    focused = [task.title, attempt.purpose, activityPurpose];
    summary = [task.title, '회차 역할 ' + roleLabel(attempt.role), '회차 상태 ' + statusLabel(attempt.status),
      attempt.outcome ? '회차 결과 ' + statusLabel(attempt.outcome) : null, attempt.purpose, activityPurpose];
  } else if (task) {
    focused = taskProse(task);
    nav.push(...tasksOfStage(snapshot, task.stage).map(item => item.title));
    summary = taskSummary(task);
  } else if (stage) {
    const tasks = tasksOfStage(snapshot, stage.id);
    const waits = snapshot.waits.filter(wait => wait.stage === stage.id).map(wait => wait.reason?.trim());
    focused = [stage.label, ...tasks.flatMap(item => [item.title, item.purpose?.split('\n')[0]]), ...waits];
    nav.push(...visibleStages(snapshot).map(item => item.label));
    summary = [stage.label, '단계 상태 ' + statusLabel(stage.status), ...tasks.map(item => [
      item.title, '작업 상태 ' + statusLabel(item.status), item.purpose?.split('\n')[0],
    ].filter(Boolean).join('\n')), ...waits];
  } else {
    const tabProse = runProse(snapshot, tab, events);
    focused = [snapshot.run.title, snapshot.run.projectName, ...tabProse];
    nav.push(...visibleStages(snapshot).map(item => item.label));
    summary = [snapshot.run.title, '실행 상태 ' + statusLabel(snapshot.run.status), snapshot.focus.sentence, waiting, ...tabProse];
  }

  const candidates = [...new Set([...focused, ...nav].filter((value): value is string => Boolean(value?.trim())))];
  const translations = candidates.filter(value => value.length <= 32000 && foreign.test(value.replace(paths, ''))).map(protectPaths);
  const translation = withinBudget(new Set(translations.map(entry => entry.text)), 160, 120000);
  const selected = new Set(translation.texts);
  const summaryContent = summary.filter((value): value is string => Boolean(value?.trim()));
  const safeSummary = summaryContent.filter(value => value.length <= 32000).map(value => value.replace(paths, '(경로 생략)'));
  const summaryPayload = withinBudget(safeSummary, 48, 32000);
  return {
    translations: translations.filter(entry => selected.has(entry.text)), translationTexts: translation.texts, summaryTexts: summaryPayload.texts,
    translationLimited: translation.limited || candidates.some(value => value.length > 32000 && foreign.test(value)),
    summaryLimited: summaryPayload.limited || summaryContent.length !== safeSummary.length,
  };
}

/** 경로 표식이 그대로 돌아온 번역에만 원래 경로를 로컬에서 복원한다. */
export function translatedText(entry: TranslationSource, text: string): string | null {
  let result = text;
  for (const path of entry.paths) {
    if (result.split(path.token).length !== 2) return null;
    result = result.replace(path.token, () => path.value);
  }
  return result;
}
