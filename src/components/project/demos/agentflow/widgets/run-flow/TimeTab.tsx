import { clock, duration, statusKind } from '@/components/project/demos/agentflow/shared/lib/format';
import { Duration, MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusMark } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import { longestWaits, repeatWarnings, slowestTasks, timeBreakdown, waitLabel } from '@/components/project/demos/agentflow/entities/monitor/model/selectors';
import { visibleStages } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import type { RunViewProps } from './types';

/** 전체 경과가 어디에 쓰였는지. 병렬 실행은 겹친 시간을 한 번만 센다. */
function Breakdown({ snapshot, nowMs, live }: Pick<RunViewProps, 'snapshot' | 'nowMs' | 'live'>) {
  const split = timeBreakdown(snapshot, live ? nowMs : Date.parse(snapshot.generatedAt));
  if (!split) return <p className="section-empty"><MissingValue /> 시작 또는 종료 시각이 기록되지 않아 시간을 나눌 수 없음</p>;
  const parts = [
    { id: 'agent', label: '에이전트 실행', ms: split.agentMs, className: 'bk-agent' },
    { id: 'wait', label: '대기 (실행 중인 에이전트 없음)', ms: split.waitMs, className: 'bk-wait' },
    { id: 'other', label: 'Master 처리 또는 미기록', ms: split.otherMs, className: 'bk-other' },
  ];
  return <div className="breakdown">
    <div className="breakdown-bar" role="img" aria-label={parts.map(part => `${part.label} ${duration(part.ms)}`).join(', ')}>
      {parts.map(part => part.ms > 0 && <span key={part.id} className={part.className} style={{ width: `${(part.ms / split.totalMs) * 100}%` }} />)}
    </div>
    <dl className="breakdown-list">
      {parts.map(part => <div key={part.id}><dt><span className={`legend-swatch ${part.className}`} aria-hidden="true" />{part.label}</dt><dd className="num">{duration(part.ms)}<small>{split.totalMs ? ` ${Math.round((part.ms / split.totalMs) * 100)}%` : ''}</small></dd></div>)}
      <div className="breakdown-total"><dt>전체</dt><dd className="num">{duration(split.totalMs)}</dd></div>
    </dl>
  </div>;
}

export function TimeTab({ snapshot, nowMs, live, display, onSelect }: RunViewProps) {
  const slow = slowestTasks(snapshot);
  const waits = longestWaits(snapshot);
  const repeats = repeatWarnings(snapshot);
  const maxTask = Math.max(1, ...slow.map(task => task.elapsedMs ?? 0));
  return <div className="time-tab">
    <section><h2 className="section-title">전체 시간 구성</h2><Breakdown snapshot={snapshot} nowMs={nowMs} live={live} /></section>

    <section><h2 className="section-title">단계별 소요</h2>
      <table className="data-table"><thead><tr><th>단계</th><th>시작</th><th>종료</th><th className="right">경과</th></tr></thead>
        <tbody>{visibleStages(snapshot).map(stage => <tr key={stage.id}>
          <td><button className="link-button" onClick={() => onSelect({ stageId: stage.id, taskId: null, attemptId: null })}><StatusMark kind={statusKind(stage.status)} />{display(stage.label)}</button></td>
          <td className="num">{stage.startedAt ? clock(stage.startedAt) : <MissingValue />}</td>
          <td className="num">{stage.endedAt ? clock(stage.endedAt) : <MissingValue label={stage.status === 'DONE' ? '종료 시각 기록 없음' : '아직 끝나지 않음'} />}</td>
          <td className="right"><Duration ms={stage.elapsedMs} /></td>
        </tr>)}</tbody></table>
    </section>

    <div className="two-col">
      <section><h2 className="section-title">오래 걸린 작업</h2>
        {slow.length ? <ol className="rank">{slow.map(task => <li key={task.id}>
          <button className="rank-row" onClick={() => onSelect({ stageId: task.stage, taskId: task.id, attemptId: null })}>
            <span className="rank-title">{display(task.title)}</span><span className="num">{duration(task.elapsedMs, true)}</span>
            <span className="rank-bar" aria-hidden="true"><span style={{ width: `${((task.elapsedMs ?? 0) / maxTask) * 100}%` }} /></span>
          </button></li>)}</ol> : <p className="section-empty"><MissingValue /> 소요 시간이 기록된 작업이 없음</p>}
      </section>
      <section><h2 className="section-title">가장 길었던 대기</h2>
        {waits.length ? <ol className="rank">{waits.map(wait => <li key={wait.id} className="rank-row is-static">
          <span className="rank-title">{display(waitLabel(wait))}</span><span className="num">{duration(wait.elapsedMs, true)}</span>
          <span className="rank-sub num">{wait.startedAt ? clock(wait.startedAt) : '—'}{wait.open ? ' · 진행 중' : ''}</span></li>)}</ol> : <p className="section-empty">기록된 대기가 없음</p>}
      </section>
    </div>

    {repeats.length > 0 && <section><h2 className="section-title">반복 지적</h2>
      <ul className="repeat-list">{repeats.map(item => <li key={item.topic}><span className="repeat-topic">{display(item.topic)}</span><span className="num">현재 구간 {item.count}회{item.total != null ? ` · 누적 ${item.total}회` : ''}</span></li>)}</ul>
    </section>}
  </div>;
}
