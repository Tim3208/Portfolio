import { useMemo, useState } from 'react';
import { duration, statusKind } from '@/components/project/demos/agentflow/shared/lib/format';
import { MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusMark } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import { TimeStrip } from '@/components/project/demos/agentflow/shared/ui/TimeStrip';
import { buildLanes, stageProgress, timeAxis, windowOptions, type WindowKey } from '@/components/project/demos/agentflow/entities/monitor/model/selectors';
import { visibleStages } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import type { RunViewProps } from './types';

/** 단계 파이프라인: 어느 단계까지 왔고 단계마다 얼마나 걸렸는지 한 줄로 본다. */
function Pipeline({ snapshot, display, onSelect }: Pick<RunViewProps, 'snapshot' | 'display' | 'onSelect'>) {
  return <ol className="pipeline" aria-label="단계 진행 흐름">
    {visibleStages(snapshot).map(stage => {
      const { done, total } = stageProgress(snapshot, stage.id);
      const current = stage.id === snapshot.focus.stage && snapshot.run.active;
      return <li key={stage.id} className={current ? 'is-current' : ''}>
        <button className="pipe-stage" onClick={() => onSelect({ stageId: stage.id, taskId: null, attemptId: null })} aria-current={current ? 'step' : undefined}>
          <span className="pipe-name"><StatusMark kind={statusKind(stage.status)} />{display(stage.label)}</span>
          <span className="pipe-meta num">{total ? `작업 ${done}/${total}` : '작업 없음'} · {stage.elapsedMs == null ? <MissingValue /> : duration(stage.elapsedMs, true)}</span>
        </button>
      </li>;
    })}
  </ol>;
}

const legend: { tone: string; label: string }[] = [
  { tone: 'live', label: '실행 중' }, { tone: 'good', label: '완료' }, { tone: 'bad', label: '실패' }, { tone: 'wait', label: '대기' }, { tone: 'unknown', label: '끝 미기록' },
];

/** 역할별 레인 타임라인. 막대를 누르면 해당 회차로 바로 들어간다. */
function Lanes({ snapshot, nowMs, live, display, onSelect }: Pick<RunViewProps, 'snapshot' | 'nowMs' | 'live' | 'display' | 'onSelect'>) {
  const [windowKey, setWindowKey] = useState<WindowKey>('all');
  const axis = timeAxis(snapshot, windowKey, nowMs);
  const lanes = useMemo(() => buildLanes(snapshot, display), [snapshot, display]);
  return <section className="lanes" aria-label="역할별 시간 흐름">
    <header className="section-head">
      <h2>시간 흐름</h2>
      <div className="chip-row" role="group" aria-label="보기 범위">
        {windowOptions.map(option => <button key={option.id} className={`chip${windowKey === option.id ? ' is-selected' : ''}`} aria-pressed={windowKey === option.id} onClick={() => setWindowKey(option.id)}>{option.label}</button>)}
      </div>
    </header>
    {axis ? <>
      <div className="lane-grid">
        {lanes.map(lane => <div className="lane" key={lane.id}>
          <span className="lane-label">{lane.label}</span>
          <TimeStrip axis={axis} nowMs={live ? nowMs : null} rows={lane.rows} waits={lane.waits} ticks={lane.ticks} rowHeight={16} label={`${lane.label} 시간 막대`} onSelect={onSelect} />
        </div>)}
        <div className="lane lane-axis"><span className="lane-label" /><TimeStrip axis={axis} nowMs={null} rows={[]} label="시간 축" labels rowHeight={0} /></div>
      </div>
      <ul className="legend" aria-label="범례">
        {legend.map(item => <li key={item.tone}><span className={`legend-swatch tone-${item.tone}`} aria-hidden="true" />{item.label}</li>)}
        <li><span className="legend-now" aria-hidden="true" />현재 시각</li>
      </ul>
    </> : <p className="section-empty"><MissingValue label="시작 시각 기록 없음" /> 시작 시각이 기록되지 않아 시간 축을 그릴 수 없음</p>}
  </section>;
}

export function FlowTab(props: RunViewProps) {
  return <div className="flow-tab"><Pipeline snapshot={props.snapshot} display={props.display} onSelect={props.onSelect} /><Lanes {...props} /></div>;
}
