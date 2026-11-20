import { useCallback } from 'react';
import type { Assignment, ObservedSetting, RequestedSetting } from '@/components/project/demos/agentflow/shared/api/contract';
import { clock, duration, providerLabel, roleLabel, statusLabel } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon } from '@/components/project/demos/agentflow/shared/ui/Icon';
import { Disclosure, Duration, MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusBadge } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import { TimeStrip } from '@/components/project/demos/agentflow/shared/ui/TimeStrip';
import type { Segment } from '@/components/project/demos/agentflow/shared/lib/timeline';
import { attemptLabel } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import { packRows } from '@/components/project/demos/agentflow/entities/monitor/model/selectors';
import type { RunViewProps } from '@/components/project/demos/agentflow/widgets/run-flow/types';
import { ActivityList } from './ActivityList';

const requestedText = (setting?: RequestedSetting): string | null => !setting ? null : setting.mode === 'explicit' ? setting.value : setting.mode === 'inherit' ? '상위 설정 상속' : '기본값';

/** 관측되지 않은 값은 이유를 툴팁으로 남기고 값처럼 보이지 않게 한다. */
function Observed({ setting }: { setting?: ObservedSetting }) {
  if (!setting) return <MissingValue label="관측 기록 없음" />;
  return setting.status === 'known' && setting.value ? <span>{setting.value}</span> : <span className="missing" title={setting.reason ?? '관측되지 않음'}>관측되지 않음</span>;
}
const gap = (from?: string | null, to?: string | null) => from && to && Number.isFinite(Date.parse(from)) && Number.isFinite(Date.parse(to)) ? Math.max(0, Date.parse(to) - Date.parse(from)) : null;

/** 배정 → 시작 → 종료 단계. 기록된 시각 사이의 간격만 보여 주며 기록이 없는 구간은 비워 둔다. */
function Lifecycle({ attempt }: { attempt: Assignment }) {
  const steps = [
    { id: 'assigned', label: '배정', at: attempt.assignedAt, note: null as string | null },
    { id: 'started', label: '시작', at: attempt.startedAt, note: gap(attempt.assignedAt, attempt.startedAt) !== null ? `대기 ${duration(gap(attempt.assignedAt, attempt.startedAt))}` : null },
    { id: 'ended', label: '종료', at: attempt.endedAt, note: gap(attempt.startedAt, attempt.endedAt) !== null ? `실행 ${duration(gap(attempt.startedAt, attempt.endedAt))}` : null },
  ];
  return <ol className="lifecycle" aria-label="배정에서 종료까지">
    {steps.map(step => <li key={step.id}>
      <span className="lifecycle-label">{step.label}</span>
      <span className="num">{step.at ? clock(step.at) : <MissingValue />}</span>
      {step.note && <span className="lifecycle-note num">{step.note}</span>}
    </li>)}
  </ol>;
}

/** 한 회차: 누가 어떤 설정으로 실행했고 무엇을 했는지. 모델 설정은 요청한 값과 관측된 값을 나란히 둔다. */
export function AttemptView({ snapshot, nowMs, live, taskId, attemptId, display, onRecord, onVisibleActivity }: RunViewProps & {
  taskId: string;
  attemptId: string;
  onVisibleActivity: (selection: { runId: string; attemptId: string; purpose: string | null } | null) => void;
}) {
  const task = snapshot.tasks.find(item => item.id === taskId);
  const attempt = task?.attempts.find(item => item.id === attemptId);
  const reportPurpose = useCallback((purpose: string | null) => onVisibleActivity({ runId: snapshot.run.id, attemptId, purpose }), [snapshot.run.id, attemptId, onVisibleActivity]);
  if (!task || !attempt) return null;
  const activities = snapshot.activities.filter(activity => attempt.assignmentId && activity.assignmentId === attempt.assignmentId);
  const spans = activities.flatMap((activity): Segment<string>[] => {
    const start = activity.startedAt ? Date.parse(activity.startedAt) : NaN;
    if (!Number.isFinite(start)) return [];
    const end = activity.endedAt ? Date.parse(activity.endedAt) : null;
    return [{ id: activity.id, start, end, tone: /^(?:fail|error)/iu.test(activity.status) ? 'bad' : end === null ? 'live' : 'good', label: activity.title || activity.kind || '활동', target: null }];
  });
  const begin = attempt.startedAt ? Date.parse(attempt.startedAt) : spans.length ? Math.min(...spans.map(item => item.start)) : NaN;
  const finish = attempt.endedAt ? Date.parse(attempt.endedAt) : live ? nowMs : spans.length ? Math.max(...spans.map(item => item.end ?? item.start)) : NaN;
  const strip = Number.isFinite(begin) && Number.isFinite(finish) && finish > begin && spans.length ? { axis: { start: begin, end: finish }, rows: packRows(spans) } : null;
  const refs = attempt.rawRefs ?? [];
  const requestedModel = requestedText(attempt.requested?.model);
  const requestedEffort = requestedText(attempt.requested?.effort);
  const usageModels = attempt.observed?.usageModels?.map(item => item.value) ?? [];
  const executor = [attempt.role === 'reviewer' ? 'Claude' : providerLabel(attempt.provider), roleLabel(attempt.role)].filter(Boolean).join(' · ');

  return <div className="view attempt-view">
    <header className="view-head">
      <div className="view-title-row"><h3 className="view-title">{attemptLabel(task, attempt)}</h3><StatusBadge status={attempt.status} /></div>
      <p className="view-sub"><span>{executor}</span>{attempt.actor && <span>수행자 {attempt.actor}</span>}<span>실행 <Duration ms={attempt.elapsedMs} /></span>{attempt.outcome && <span>결과 {statusLabel(attempt.outcome)}</span>}</p>
    </header>

    <Lifecycle attempt={attempt} />

    <section>
      <h2 className="section-title">모델 설정</h2>
      <table className="data-table setting-table"><thead><tr><th>항목</th><th>요청</th><th>관측</th></tr></thead>
        <tbody>
          <tr><td>모델</td><td>{requestedModel ?? <MissingValue />}</td><td><Observed setting={attempt.observed?.model} /></td></tr>
          <tr><td>추론 강도</td><td>{requestedEffort ?? <MissingValue />}</td><td><Observed setting={attempt.observed?.effort} /></td></tr>
          {usageModels.length > 0 && <tr><td>사용 모델</td><td><MissingValue label="요청 대상 아님" /></td><td>{usageModels.join(', ')}</td></tr>}
        </tbody></table>
    </section>

    {attempt.purpose && <section><h2 className="section-title">배정 사유</h2><p className="body-text">{display(attempt.purpose)}</p></section>}

    <section>
      <h2 className="section-title">활동</h2>
      {strip && <div className="attempt-strip"><TimeStrip axis={strip.axis} nowMs={live && !attempt.endedAt ? nowMs : null} rows={strip.rows} rowHeight={8} labels label="활동 시간 막대" /></div>}
      <ActivityList key={attempt.id} activities={activities} display={display} onRecord={onRecord} onVisiblePurpose={reportPurpose} />
    </section>

    {refs.length > 0 && <section>
      <h2 className="section-title">실행 기록</h2>
      <div className="ref-row">{refs.map((ref, index) => <button key={ref} className="text-button" title={ref} onClick={() => onRecord(ref)}><Icon name="file" size={14} />실행 기록 {refs.length > 1 ? index + 1 : ''}</button>)}</div>
    </section>}

    <Disclosure summary="세부 정보">
      <dl className="detail-ids">
        <div><dt>배정 ID</dt><dd><code>{attempt.assignmentId}</code></dd></div>
        {attempt.previousAssignmentId && <div><dt>이전 배정</dt><dd><code>{attempt.previousAssignmentId}</code></dd></div>}
        {attempt.relationship && <div><dt>관계</dt><dd><code>{attempt.relationship}</code></dd></div>}
      </dl>
    </Disclosure>
  </div>;
}
