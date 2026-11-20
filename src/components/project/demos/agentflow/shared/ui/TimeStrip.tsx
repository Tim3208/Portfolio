import { clock, duration } from '@/components/project/demos/agentflow/shared/lib/format';
import { percentOf, type Axis, type Segment, type Tick } from '@/components/project/demos/agentflow/shared/lib/timeline';

interface TimeStripProps<T> {
  axis: Axis;
  /** 진행 중 구간의 끝과 현재선 위치. 끝난 실행이나 연결이 끊긴 화면에서는 null로 둔다. */
  nowMs: number | null;
  rows: Segment<T>[][];
  waits?: Segment<T>[];
  ticks?: Tick<T>[];
  label: string;
  rowHeight?: number;
  /** true이면 축의 시작·끝 시각을 아래에 표시한다. */
  labels?: boolean;
  onSelect?: (target: T) => void;
}

const span = (segment: Segment<unknown>, axis: Axis, nowMs: number | null) => {
  const start = Math.max(segment.start, axis.start);
  const end = Math.min(segment.end ?? nowMs ?? axis.end, axis.end);
  return end > axis.start && start < axis.end ? { left: percentOf(axis, start), width: Math.max(0, percentOf(axis, end) - percentOf(axis, start)) } : null;
};

function describe(segment: Segment<unknown>, nowMs: number | null): string {
  const startIso = new Date(segment.start).toISOString();
  const endIso = segment.end === null ? null : new Date(segment.end).toISOString();
  const length = segment.end !== null ? duration(segment.end - segment.start) : nowMs !== null ? `${duration(nowMs - segment.start)} 경과` : '끝 시각 미기록';
  return `${segment.label} · ${clock(startIso)}${endIso ? ` – ${clock(endIso)}` : ' – 진행 중'} · ${length}`;
}

/**
 * 모든 깊이에서 같은 모양으로 쓰는 시간 막대. 위치와 길이는 기록된 시각만으로 계산하고,
 * 끝이 없는 구간은 nowMs까지(없으면 축 끝까지) 그린다. 앰버 세로선이 현재 시각이다.
 */
export function TimeStrip<T>({ axis, nowMs, rows, waits = [], ticks = [], label, rowHeight = 16, labels = false, onSelect }: TimeStripProps<T>) {
  const renderSegment = (segment: Segment<T>) => {
    const box = span(segment, axis, nowMs);
    if (!box) return null;
    const style = { left: `${box.left}%`, width: `${box.width}%` };
    const text = describe(segment, nowMs);
    const className = `ts-seg tone-${segment.tone}`;
    return segment.target !== null && onSelect
      ? <button key={segment.id} className={className} style={style} title={text} aria-label={text} onClick={() => onSelect(segment.target as T)} />
      : <div key={segment.id} className={className} style={style} title={text} role="img" aria-label={text} />;
  };
  const tickMarks = ticks.filter(tick => tick.at >= axis.start && tick.at <= axis.end);
  return <div className="timestrip" role="group" aria-label={label} style={{ ['--ts-row' as string]: `${rowHeight}px` }}>
    <div className="ts-body">
      {waits.length > 0 && <div className="ts-row ts-wait-row">{waits.map(renderSegment)}</div>}
      {rows.length ? rows.map((row, index) => <div className="ts-row" key={index}>{row.map(renderSegment)}</div>) : <div className="ts-row" />}
      {tickMarks.map(tick => <span key={tick.id} className={`ts-tick tone-${tick.tone}`} style={{ left: `${percentOf(axis, tick.at)}%` }} title={`${tick.label} · ${clock(new Date(tick.at).toISOString())}`} />)}
      {nowMs !== null && nowMs >= axis.start && nowMs <= axis.end && <span className="ts-now" style={{ left: `${percentOf(axis, nowMs)}%` }} aria-hidden="true" />}
    </div>
    {labels && <div className="ts-labels num"><span>{clock(new Date(axis.start).toISOString())}</span><span>{clock(new Date(axis.end).toISOString())}</span></div>}
  </div>;
}
