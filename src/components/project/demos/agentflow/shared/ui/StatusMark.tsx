import { statusKind, statusLabel, type StatusKind } from '@/components/project/demos/agentflow/shared/lib/format';

/** 상태마다 모양이 다른 표식. 색에만 의존하지 않도록 모양과 글자를 함께 쓴다. */
export function StatusMark({ kind, size = 16 }: { kind: StatusKind; size?: number }) {
  return <svg className={`mark mark-${kind}`} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'live' && <><circle cx="8" cy="8" r="6" opacity=".4" /><circle cx="8" cy="8" r="3" fill="currentColor" stroke="none" /></>}
    {kind === 'good' && <><circle cx="8" cy="8" r="6" /><path d="m5.5 8.2 1.8 1.8 3.2-3.6" /></>}
    {kind === 'bad' && <><rect x="2" y="2" width="12" height="12" rx="3" /><path d="m5.8 5.8 4.4 4.4M10.2 5.8l-4.4 4.4" /></>}
    {kind === 'wait' && <path d="M5 2.5h6M5 13.5h6M5.5 2.5v2a2.5 2.5 0 0 0 5 0v-2M5.5 13.5v-2a2.5 2.5 0 0 1 5 0v2" />}
    {kind === 'pending' && <circle cx="8" cy="8" r="5.5" />}
    {kind === 'unknown' && <circle cx="8" cy="8" r="5.5" strokeDasharray="2.4 2.4" />}
  </svg>;
}

/** 표식과 상태 이름. 알 수 없는 상태는 원문을 툴팁으로 보존한다. */
export function StatusBadge({ status }: { status?: string | null }) {
  return <span className="status-badge" title={status ?? '기록 없음'}><StatusMark kind={statusKind(status)} />{statusLabel(status)}</span>;
}
