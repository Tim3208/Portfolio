import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { duration } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon, type IconName } from './Icon';

/** 기록되지 않은 값. 0이나 추정값으로 바꾸지 않고 사유를 접근성 이름으로 제공한다. */
export function MissingValue({ label = '기록 없음' }: { label?: string }) {
  return <span className="missing" title={label} aria-label={label}>—</span>;
}

/** 경과 시간. 값이 없으면 빈 칸 대신 MissingValue를 보여 준다. */
export function Duration({ ms, compact = false }: { ms: number | null | undefined; compact?: boolean }) {
  return ms == null ? <MissingValue /> : <span className="num">{duration(ms, compact)}</span>;
}

export function Keycap({ children }: { children: ReactNode }) {
  return <kbd className="keycap">{children}</kbd>;
}

export interface TabItem<T extends string> { id: T; label: string; count?: number | null }

/** 화살표·Home·End로 이동하는 탭 목록. 패널은 `aria-labelledby`로 연결한다. */
export function Tabs<T extends string>({ items, value, onChange, label, idPrefix }: { items: TabItem<T>[]; value: T; onChange: (id: T) => void; label: string; idPrefix: string }) {
  const refs = useRef(new Map<T, HTMLButtonElement>());
  function move(event: KeyboardEvent, index: number) {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: items.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = items[(keys[event.key] + items.length) % items.length];
    onChange(next.id);
    refs.current.get(next.id)?.focus();
  }
  return <div className="tabs" role="tablist" aria-label={label}>
    {items.map((item, index) => <button
      key={item.id} id={`${idPrefix}-tab-${item.id}`} ref={node => { if (node) refs.current.set(item.id, node); else refs.current.delete(item.id); }}
      role="tab" aria-selected={item.id === value} aria-controls={`${idPrefix}-panel`} tabIndex={item.id === value ? 0 : -1}
      className={`tab${item.id === value ? ' is-selected' : ''}`} onClick={() => onChange(item.id)} onKeyDown={event => move(event, index)}
    >{item.label}{item.count != null && <span className="tab-count num">{item.count}</span>}</button>)}
  </div>;
}

export function TabPanel({ idPrefix, tab, children }: { idPrefix: string; tab: string; children: ReactNode }) {
  return <div className="tab-panel" role="tabpanel" id={`${idPrefix}-panel`} aria-labelledby={`${idPrefix}-tab-${tab}`}>{children}</div>;
}

/** 비어 있음·오류·안내 화면. 레이아웃 뼈대는 유지하고 장식 없이 문장으로만 알린다. */
export function EmptyState({ title, description, icon, children }: { title: string; description?: string; icon?: IconName; children?: ReactNode }) {
  return <div className="empty-state">
    {icon && <Icon name={icon} size={20} />}
    <h2>{title}</h2>
    {description && <p>{description}</p>}
    {children}
  </div>;
}

/** 접었다 펴는 보조 정보. 화면 이동과 무관하게 열림 상태는 사용자가 정한다. */
export function Disclosure({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  return <details className="disclosure"><summary>{summary}</summary><div className="disclosure-body">{children}</div></details>;
}
