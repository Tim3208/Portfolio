import type { ReactNode } from 'react';
import { clock } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon } from '@/components/project/demos/agentflow/shared/ui/Icon';
import { Keycap } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { breadcrumbs, type Crumb, type Path } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import type { MonitorSnapshot } from '@/components/project/demos/agentflow/shared/api/contract';
import type { DisplayText } from '@/components/project/demos/agentflow/features/view-language/projection';

export type ConnectionState = 'connected' | 'connecting' | 'offline';
const connectionText: Record<ConnectionState, string> = { connected: '기록 연결됨', connecting: '연결 중', offline: '연결 확인 중' };

export function AppBar({ switcher, connection, onRefresh }: { switcher: ReactNode; connection: ConnectionState; onRefresh: () => void }) {
  return <header className="app-bar">
    <div className="app-brand"><Icon name="flow" size={18} /><strong>AgentFlow</strong><span>Monitor</span></div>
    {switcher}
    <div className="app-bar-right">
      <span className={`connection is-${connection}`}><span className="connection-dot" aria-hidden="true" />{connectionText[connection]}</span>
      <button className="icon-button" aria-label="기록 다시 확인" title="다시 확인" onClick={onRefresh}><Icon name="refresh" /></button>
    </div>
  </header>;
}

/** 안내 한 줄. 지난 실행을 보는 중이거나 연결이 끊겼을 때 본문 위에 놓이며 화면 구조는 그대로 둔다. */
export function Banner({ tone, children, action }: { tone: 'neutral' | 'wait'; children: ReactNode; action?: { label: string; onClick: () => void } }) {
  return <div className={`banner is-${tone}`} role="status"><Icon name={tone === 'wait' ? 'alert' : 'clock'} /><span>{children}</span>{action && <button className="text-button" onClick={action.onClick}>{action.label}</button>}</div>;
}

interface CrumbBarProps { snapshot: MonitorSnapshot | null; path: Path; display: DisplayText; follow: boolean; canFollow: boolean; onSelect: (path: Path) => void; onFollow: () => void; onUp: () => void }

/** 현재 위치와 따라가기 상태. 구간마다 눌러서 그 깊이로 올라갈 수 있다. */
export function CrumbBar({ snapshot, path, display, follow, canFollow, onSelect, onFollow, onUp }: CrumbBarProps) {
  const crumbs: Crumb[] = breadcrumbs(snapshot, path);
  return <div className="crumb-bar">
    <nav aria-label="현재 위치"><ol className="crumbs">
      {crumbs.map((crumb, index) => <li key={crumb.key}>
        {index > 0 && <Icon name="chevron" size={12} />}
        {index === crumbs.length - 1
          ? <span className="crumb is-current" aria-current="page">{crumb.depth === 1 ? '흐름' : display(crumb.label)}</span>
          : <button className="crumb" onClick={() => onSelect(crumb.path)}>{crumb.depth === 1 ? '흐름' : display(crumb.label)}</button>}
      </li>)}
    </ol></nav>
    <div className="crumb-actions">
      {crumbs.length > 1 && <button className="text-button" onClick={onUp}><Icon name="up" size={14} />위로<Keycap>Esc</Keycap></button>}
      {canFollow && <button className={`follow${follow ? ' is-on' : ''}`} role="switch" aria-checked={follow} onClick={onFollow} title={follow ? '지금 작업을 자동으로 따라가는 중' : '지금 작업으로 돌아가기 (Alt+C)'}>
        <span className="follow-track" aria-hidden="true"><span className="follow-thumb" /></span>현재 작업 따라가기
      </button>}
    </div>
  </div>;
}

export function StatusBar({ connection, updatedAt }: { connection: ConnectionState; updatedAt: string | null }) {
  return <footer className={`status-bar is-${connection}`}>
    <span>{connection === 'offline' ? `연결 끊김 · ${updatedAt ? `${clock(updatedAt)} 기준 정보` : '받은 정보 없음'} · 다시 연결 시도 중` : connectionText[connection]}</span>
    <span className="status-keys">
      {updatedAt && <span>마지막 확인 <time className="num" dateTime={updatedAt}>{clock(updatedAt)}</time></span>}
      <span><Keycap>Esc</Keycap> 위로</span><span><Keycap>Alt C</Keycap> 현재 작업</span><span><Keycap>Alt H</Keycap> 실행 전환</span>
    </span>
  </footer>;
}
