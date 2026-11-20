import { useMemo } from 'react';
import type { FocusKind, MonitorSnapshot } from '@/components/project/demos/agentflow/shared/api/contract';
import { ago, clock, providerLabel, roleLabel, type StatusKind } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon } from '@/components/project/demos/agentflow/shared/ui/Icon';
import { Duration, MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusMark } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import { TimeStrip } from '@/components/project/demos/agentflow/shared/ui/TimeStrip';
import { packRows, assignmentPath, buildLanes, elapsedSince, timeAxis } from '@/components/project/demos/agentflow/entities/monitor/model/selectors';
import type { Path } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import type { DisplayText } from '@/components/project/demos/agentflow/features/view-language/projection';

const markOf: Record<FocusKind, StatusKind> = {
  done: 'good', ended: 'unknown', 'waiting-user': 'wait', 'waiting-quota': 'wait', 'master-decision': 'wait', blocked: 'bad',
  'agent-running': 'live', 'review-running': 'live', 'review-queued': 'wait', 'waiting-qa-scope': 'wait', finishing: 'live', dispatching: 'live',
};

/** 기다리는 상태에서 사용자나 Master가 해야 할 일. 기록된 상태 이름에서만 정하며 원인을 추정하지 않는다. */
const needs: Partial<Record<FocusKind, string>> = {
  'waiting-user': '사용자 답변이 필요함', 'waiting-quota': '사용 한도가 재개될 때까지 대기', 'master-decision': 'Master 판단이 필요함',
  blocked: '진행 막힘을 풀어야 함', 'waiting-qa-scope': '검증 범위를 선택해야 함', 'review-queued': 'Claude 검토가 시작되길 대기',
};

interface NowBarProps {
  snapshot: MonitorSnapshot;
  nowMs: number;
  live: boolean;
  display: DisplayText;
  /** 시간 막대는 흐름 화면의 레인과 겹치므로 더 깊은 화면에서만 보여 준다. */
  showStrip: boolean;
  onFollow: () => void;
  onSelect: (path: Path) => void;
}

/** 항상 보이는 "지금" 영역. Master가 기다리거나 지시하는 대상과 그 상태가 이어진 시간을 가장 먼저 말한다. */
export function NowBar({ snapshot, nowMs, live, display, showStrip, onFollow, onSelect }: NowBarProps) {
  const { focus, run, metrics } = snapshot;
  const ended = focus.kind === 'done' || focus.kind === 'ended';
  const stageLabel = snapshot.stages.find(stage => stage.id === focus.stage)?.label ?? null;
  const stateMs = live && focus.since ? elapsedSince(focus.since, nowMs) : focus.elapsedMs;
  const totalMs = live ? elapsedSince(run.createdAt, nowMs) ?? metrics.elapsedMs : metrics.elapsedMs;
  const running = snapshot.assignments.filter(item => item.status === 'STARTED' && item.role !== 'master');
  const waitReason = snapshot.waiting?.reason ?? null;
  const sinceRecord = live ? elapsedSince(snapshot.lastRecordAt, nowMs) : focus.quietMs;

  const strip = useMemo(() => {
    const axis = timeAxis(snapshot, 'all', nowMs);
    const lanes = buildLanes(snapshot, display);
    const workers = lanes.filter(lane => lane.id !== 'master');
    return axis ? { axis, rows: packRows(workers.flatMap(lane => lane.rows.flat())).slice(0, 3), waits: lanes.find(lane => lane.id === 'master')?.waits ?? [] } : null;
  }, [snapshot, nowMs, display]);

  return <section className="now" aria-label="지금">
    <div className="now-head">
      <button className="now-main" onClick={onFollow} title="이 작업을 따라가기 (Alt+C)">
        <StatusMark kind={markOf[focus.kind]} size={20} />
        <span className="now-text">
          <span className="now-sentence">{display(focus.sentence)}</span>
          <span className="now-sub">
            {ended
              ? (focus.since ? <>종료 <time className="num" dateTime={focus.since}>{clock(focus.since)}</time></> : '종료 시각 기록 없음')
              : <>{display(stageLabel ?? '단계 기록 없음')}{focus.since ? <> · 이 상태 시작 <time className="num" dateTime={focus.since}>{clock(focus.since)}</time></> : ' · 시작 시각 기록 없음'}</>}
          </span>
        </span>
      </button>
      <div className="now-clock">
        <span className="now-elapsed num">{ended ? <Duration ms={metrics.elapsedMs} /> : stateMs == null ? <MissingValue label="시작 시각 기록 없음" /> : <Duration ms={stateMs} />}</span>
        <span className="now-clock-label">{ended ? '전체 소요' : live ? '현재 상태 경과' : '마지막 기록 기준'}</span>
      </div>
    </div>

    {(needs[focus.kind] || focus.quiet) && <div className="now-notes">
      {needs[focus.kind] && <p className="now-note is-wait"><Icon name="hourglass" />{needs[focus.kind]}{waitReason && waitReason !== focus.sentence ? <span className="now-reason"> · {display(waitReason)}</span> : null}</p>}
      {focus.quiet && <p className="now-note is-quiet"><Icon name="alert" />{Math.floor(focus.quietAfterMs / 60000)}분 넘게 새 기록 없음{snapshot.lastRecordAt ? <> · 마지막 기록 <time className="num" dateTime={snapshot.lastRecordAt}>{clock(snapshot.lastRecordAt)}</time></> : null}</p>}
    </div>}

    <div className="now-stats">
      <dl className="now-facts">
        <div><dt>전체 경과</dt><dd><Duration ms={totalMs} /></dd></div>
        <div><dt>대기 합계</dt><dd><Duration ms={metrics.waitingMs} /></dd></div>
        <div><dt>마지막 기록</dt><dd className="num">{live ? ago(sinceRecord) ?? <MissingValue /> : snapshot.lastRecordAt ? clock(snapshot.lastRecordAt) : <MissingValue />}</dd></div>
      </dl>
      {running.length > 0 && <ul className="now-agents" aria-label="실행 중인 에이전트">
        {running.map(item => {
          const target = assignmentPath(snapshot, item);
          const task = snapshot.tasks.find(candidate => candidate.id === item.taskId);
          const runningMs = live ? elapsedSince(item.startedAt, nowMs) : null;
          const content = <><StatusMark kind="live" size={12} /><span>{item.role === 'reviewer' ? 'Claude' : providerLabel(item.provider)} · {roleLabel(item.role)}</span>{task && <span className="now-agent-task">{display(task.title)}</span>}<Duration ms={runningMs} compact /></>;
          return <li key={item.id}>{target ? <button className="now-agent" onClick={() => onSelect(target)}>{content}</button> : <span className="now-agent">{content}</span>}</li>;
        })}
      </ul>}
    </div>

    {showStrip && strip && <div className="now-strip"><TimeStrip axis={strip.axis} nowMs={live ? nowMs : null} rows={strip.rows} waits={strip.waits} rowHeight={6} label="실행 전체 시간 막대" onSelect={onSelect} /></div>}
  </section>;
}
