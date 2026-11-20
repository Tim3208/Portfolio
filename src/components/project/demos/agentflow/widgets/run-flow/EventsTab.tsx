import { useEffect, useMemo, useState } from 'react';
import type { EventCategory, TimelineEvent } from '@/components/project/demos/agentflow/shared/api/contract';
import { clock } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon } from '@/components/project/demos/agentflow/shared/ui/Icon';
import { MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { categoryLabels, groupEvents } from '@/components/project/demos/agentflow/entities/monitor/model/selectors';
import type { RunViewProps } from './types';

const PAGE = 100;
const order = Object.keys(categoryLabels) as EventCategory[];

/** 사건 기록. 최신 사건이 위에 오며 분류와 검색어로 좁힌다. 원문이 있는 사건은 바로 열 수 있다. */
export function EventsTab({ snapshot, display, onRecord, onVisibleEvents }: RunViewProps & { onVisibleEvents: (selection: { runId: string; events: readonly TimelineEvent[] }) => void }) {
  const [categories, setCategories] = useState<ReadonlySet<EventCategory>>(new Set());
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);
  const stageLabel = (id: string | null) => display(snapshot.stages.find(stage => stage.id === id)?.label ?? '단계 미기록');
  const newestFirst = useMemo(() => [...snapshot.timeline].reverse(), [snapshot.timeline]);
  const groups = useMemo(() => groupEvents(newestFirst, { categories, query }), [newestFirst, categories, query]);
  useEffect(() => {
    onVisibleEvents({ runId: snapshot.run.id, events: groups.flatMap(group => group.events).slice(0, visible) });
    return () => onVisibleEvents({ runId: '', events: [] });
  }, [groups, visible, snapshot.run.id, onVisibleEvents]);
  const total = groups.reduce((sum, group) => sum + group.events.length, 0);
  const visibleGroups = useMemo(() => {
    const out: { stage: string | null; shown: TimelineEvent[] }[] = [];
    let left = visible;
    for (const group of groups) {
      if (left <= 0) break;
      const shown = group.events.slice(0, left);
      left -= shown.length;
      if (shown.length) out.push({ stage: group.stage, shown });
    }
    return out;
  }, [groups, visible]);

  function toggle(category: EventCategory) {
    setVisible(PAGE);
    setCategories(previous => { const next = new Set(previous); if (next.has(category)) next.delete(category); else next.add(category); return next; });
  }

  return <div className="events-tab">
    <div className="events-tools">
      <div className="chip-row" role="group" aria-label="사건 분류">
        <button className={`chip${categories.size === 0 ? ' is-selected' : ''}`} aria-pressed={categories.size === 0} onClick={() => { setCategories(new Set()); setVisible(PAGE); }}>전체</button>
        {order.map(category => <button key={category} className={`chip${categories.has(category) ? ' is-selected' : ''}`} aria-pressed={categories.has(category)} onClick={() => toggle(category)}>{categoryLabels[category]}</button>)}
      </div>
      <label className="search-field"><Icon name="search" /><input aria-label="사건 검색" placeholder="제목 검색" value={query} onChange={event => { setQuery(event.target.value); setVisible(PAGE); }} /></label>
    </div>
    <p className="events-count num">{total}건 · 최신순{snapshot.hasOlderTimeline ? ' · 더 오래된 사건은 조회 범위 밖' : ''}</p>
    {total === 0 && <p className="section-empty">{categories.size || query ? '조건에 맞는 사건이 없음' : '기록된 사건이 없음'}</p>}
    {visibleGroups.map(({ stage, shown }, groupIndex) => (
      <section className="event-group" key={`${stage}-${groupIndex}`}>
        <h3 className="event-group-title">{stageLabel(stage)}</h3>
        <ul>{shown.map(event => <li className="event-row" key={event.id}>
          <time className="num" dateTime={event.at ?? undefined}>{event.at ? clock(event.at) : <MissingValue label="시각 기록 없음" />}</time>
          <span className="event-cat">{categoryLabels[event.category]}</span>
          <span className="event-main"><span className="event-title">{display(event.title)}</span>{event.summary && <span className="event-summary">{display(event.summary)}</span>}</span>
          <span className="event-refs">{event.rawRefs.slice(0, 3).map((ref, index) => <button key={ref} className="text-button" title={ref} onClick={() => onRecord(ref)}><Icon name="file" size={14} />원본{event.rawRefs.length > 1 ? ` ${index + 1}` : ''}</button>)}</span>
        </li>)}</ul>
      </section>
    ))}
    {total > visible && <button className="more-button" onClick={() => setVisible(count => count + PAGE)}>이전 사건 {Math.min(PAGE, total - visible)}건 더 보기</button>}
  </div>;
}
