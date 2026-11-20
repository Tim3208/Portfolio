import { useMemo } from 'react';
import type { Task } from '@/components/project/demos/agentflow/shared/api/contract';
import { calendar, clock, statusKind } from '@/components/project/demos/agentflow/shared/lib/format';
import { Duration, MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusBadge, StatusMark } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import { TimeStrip } from '@/components/project/demos/agentflow/shared/ui/TimeStrip';
import { assignmentSegments, packRows, rangeOf, stageProgress, waitLabel } from '@/components/project/demos/agentflow/entities/monitor/model/selectors';
import { tasksOfStage } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import type { RunViewProps } from '@/components/project/demos/agentflow/widgets/run-flow/types';

function Counts({ task }: { task: Task }) {
  return <span className="task-counts">
    {task.attemptCount > 0 && <span>시도 {task.attemptCount}회</span>}
    {task.reviewCount > 0 && <span>검토 {task.reviewCount}회</span>}
    {task.retryCount > 0 && <span className="is-retry">재시도 {task.retryCount}회</span>}
  </span>;
}

/** 한 단계의 작업 목록. 작업마다 한 줄 요약과 그 작업의 실행 구간을 단계 시간 위에 겹쳐 보여 준다. */
export function StageView({ snapshot, nowMs, live, stageId, display, onSelect }: RunViewProps & { stageId: string }) {
  const stage = snapshot.stages.find(item => item.id === stageId);
  const tasks = tasksOfStage(snapshot, stageId);
  const { done, total } = stageProgress(snapshot, stageId);
  const stageWaits = snapshot.waits.filter(wait => wait.stage === stageId);
  const segments = useMemo(() => assignmentSegments(snapshot, item => item.stage === stageId && item.role !== 'master', display), [snapshot, stageId, display]);
  const axis = rangeOf(segments, live ? nowMs : null);
  if (!stage) return null;
  const failed = tasks.filter(task => statusKind(task.status) === 'bad').length;

  return <div className="view stage-view">
    <header className="view-head">
      <div className="view-title-row"><h3 className="view-title">{display(stage.label)}</h3><StatusBadge status={stage.status} /></div>
      <p className="view-sub">
        <span>작업 {total}개{total ? ` · 완료 ${done}` : ''}{failed ? ` · 실패 ${failed}` : ''}</span>
        <span>시작 {stage.startedAt ? <time className="num" dateTime={stage.startedAt}>{calendar(stage.startedAt)}</time> : <MissingValue />}</span>
        {stage.endedAt && <span>마지막 기록 <time className="num" dateTime={stage.endedAt}>{calendar(stage.endedAt)}</time></span>}
        <span>에이전트 실행 <Duration ms={stage.elapsedMs} /></span>
      </p>
    </header>

    {axis && <section aria-label="단계 시간 막대"><TimeStrip axis={axis} nowMs={live ? nowMs : null} rows={packRows(segments)} waits={[]} rowHeight={12} labels label={`${display(stage.label)} 단계 시간 막대`} onSelect={onSelect} /></section>}

    {stageWaits.length > 0 && <section>
      <h2 className="section-title">이 단계의 대기</h2>
      <ul className="stage-waits">{stageWaits.map(wait => <li key={wait.id}><StatusMark kind="wait" /><span>{display(waitLabel(wait))}</span><span className="num">{wait.startedAt ? clock(wait.startedAt) : '—'}{wait.open ? ' · 진행 중' : ''}</span><Duration ms={wait.elapsedMs} compact /></li>)}</ul>
    </section>}

    <section>
      <h2 className="section-title">작업</h2>
      {tasks.length ? <ul className="task-rows">
        {tasks.map(task => {
          const own = segments.filter(segment => task.attempts.some(attempt => attempt.id === segment.id));
          return <li key={task.id}>
            <button className="task-row" onClick={() => onSelect({ stageId, taskId: task.id, attemptId: null })}>
              <StatusMark kind={statusKind(task.status)} />
              <span className="task-row-main">
                <span className="task-row-title">{display(task.title)}</span>
                <span className="task-row-purpose">{display(task.purpose?.split('\n')[0] ?? '') || '목적이 기록되지 않음'}</span>
              </span>
              <Counts task={task} />
              <span className="task-row-time"><Duration ms={task.elapsedMs} compact /></span>
              {axis && own.length > 0 && <span className="task-row-strip"><TimeStrip axis={axis} nowMs={live ? nowMs : null} rows={[own]} rowHeight={6} label={`${display(task.title)} 실행 구간`} /></span>}
            </button>
          </li>;
        })}
      </ul> : <p className="section-empty">이 단계에는 작업이 없음</p>}
    </section>
  </div>;
}
