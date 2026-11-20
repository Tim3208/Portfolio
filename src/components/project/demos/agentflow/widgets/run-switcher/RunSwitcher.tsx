import { useEffect, useMemo, useRef, useState } from 'react';
import type { RunSummary } from '@/components/project/demos/agentflow/shared/api/contract';
import { calendar, duration, statusKind, statusLabel } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon } from '@/components/project/demos/agentflow/shared/ui/Icon';
import { NavList } from '@/components/project/demos/agentflow/shared/ui/NavList';
import { Keycap } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusMark } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import type { DisplayText } from '@/components/project/demos/agentflow/features/view-language/projection';

type Filter = 'all' | 'active' | 'done' | 'failed';
const filters: { id: Filter; label: string }[] = [{ id: 'all', label: '전체' }, { id: 'active', label: '진행 중' }, { id: 'done', label: '완료' }, { id: 'failed', label: '실패' }];

const matches = (run: RunSummary, filter: Filter) => filter === 'all' || (filter === 'active' ? run.active : statusKind(run.status) === (filter === 'done' ? 'good' : 'bad'));

/** 시작과 끝이 모두 기록된 실행만 걸린 시간을 보여 준다. 끝나지 않은 실행의 시간은 추정하지 않는다. */
const spent = (run: RunSummary) => run.createdAt && run.endedAt ? duration(Date.parse(run.endedAt) - Date.parse(run.createdAt), true) : null;

interface RunSwitcherProps {
  runs: RunSummary[];
  currentRunId: string | null;
  selectedRunId: string | null;
  isCurrent: boolean;
  currentPlaceholder: string;
  display: DisplayText;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCurrent: () => void;
  onHistory: (runId: string) => void;
}

/** 현재 실행과 지난 실행 사이를 전환하는 목록. 검색과 상태 필터, 프로젝트별 묶음을 제공한다. */
export function RunSwitcher({ runs, currentRunId, selectedRunId, isCurrent, currentPlaceholder, display, open, onOpenChange, onCurrent, onHistory }: RunSwitcherProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const selected = runs.find(run => run.id === selectedRunId);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    function outside(event: PointerEvent) { if (!root.current?.contains(event.target as Node)) onOpenChange(false); }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, onOpenChange]);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const visible = runs.filter(run => run.id !== currentRunId && matches(run, filter) && run.title.toLowerCase().includes(needle));
    const names = [...new Set(visible.map(run => run.projectName ?? null))];
    return names.map(name => ({ name, runs: visible.filter(run => (run.projectName ?? null) === name) }));
  }, [runs, currentRunId, filter, query]);
  const current = runs.find(run => run.id === currentRunId);

  function choose(id: string) {
    onOpenChange(false);
    if (id === currentRunId) onCurrent(); else onHistory(id);
  }

  const row = (run: RunSummary) => ({
    id: run.id, selected: run.id === selectedRunId, title: run.title,
    content: <>
      <StatusMark kind={run.active ? 'live' : statusKind(run.status)} />
      <span className="switch-row-text">
        <span className="switch-row-title">{run.title || '제목 없는 실행'}</span>
        <span className="switch-row-meta num">{calendar(run.createdAt)}{spent(run) ? ` · ${spent(run)}` : ''} · {run.active ? '진행 중' : statusLabel(run.status)}</span>
      </span>
    </>,
  });

  return <div className="switcher" ref={root} onKeyDown={event => { if (event.key === 'Escape' && open) { event.stopPropagation(); onOpenChange(false); } }}>
    <button className="switcher-button" aria-haspopup="dialog" aria-expanded={open} onClick={() => onOpenChange(!open)}>
      <span className="switcher-tag">{isCurrent ? '현재 실행' : selected?.active ? '선택한 실행' : '지난 실행'}</span>
      <span className="switcher-title">{selected?.title ? display(selected.title) : isCurrent ? currentPlaceholder : '실행 선택'}</span>
      <Icon name="chevron-down" size={14} />
    </button>
    {open && <div className="switcher-pop" role="dialog" aria-label="실행 전환">
      <div className="switcher-search"><Icon name="search" /><input ref={search} aria-label="실행 제목 검색" placeholder="제목 검색" value={query} onChange={event => setQuery(event.target.value)} /><Keycap>Alt H</Keycap></div>
      <div className="switcher-filters" role="group" aria-label="상태 필터">
        {filters.map(item => <button key={item.id} className={`chip${filter === item.id ? ' is-selected' : ''}`} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
      </div>
      <div className="switcher-list">
        {current && matches(current, filter) && <section><h3 className="switch-group">현재 실행</h3><NavList label="현재 실행" items={[row(current)].map(item => ({ ...item, selected: isCurrent }))} onSelect={choose} /></section>}
        {groups.map(group => <section key={group.name ?? '-'}>
          <h3 className="switch-group">{group.name ?? '지난 실행'}<span className="num">{group.runs.length}</span></h3>
          <NavList label={group.name ?? '지난 실행'} items={group.runs.map(row).map(item => ({ ...item, selected: !isCurrent && item.selected }))} onSelect={choose} />
        </section>)}
        {!groups.length && !(current && matches(current, filter)) && <p className="switch-empty">{query || filter !== 'all' ? '조건에 맞는 실행이 없음' : '아직 지난 실행이 없음'}</p>}
      </div>
    </div>}
  </div>;
}
