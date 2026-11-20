import { useEffect, useMemo, useState } from 'react';
import type { Activity } from '@/components/project/demos/agentflow/shared/api/contract';
import { clock, providerLabel, statusKind, statusLabel } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon } from '@/components/project/demos/agentflow/shared/ui/Icon';
import { Duration, MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusMark } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import type { DisplayText } from '@/components/project/demos/agentflow/features/view-language/projection';

const PAGE = 60;
const PREVIEW_LIMIT = 12000;
const LONG_MS = 10_000;

/** 조회 응답의 미리보기를 텍스트로만 그린다. 전체 원문은 원본 기록에서 구간 단위로 읽는다. */
function Preview({ label, text }: { label: string; text: string | null | undefined }) {
  if (typeof text !== 'string') return null;
  return <section className="preview" aria-label={`${label} 미리보기`}>
    <h4>{label}</h4>
    <pre tabIndex={0} aria-label={`${label} 내용`}>{text.length ? text.slice(0, PREVIEW_LIMIT) : `빈 ${label}`}</pre>
    {text.length > PREVIEW_LIMIT && <p>전체 내용은 원본 기록에서 확인할 수 있음</p>}
  </section>;
}

const kindOf = (activity: Activity) => String(activity.kind ?? '').trim() || '기타';

/** 한 회차의 개별 활동. 종류와 실패만 걸러 볼 수 있고 가장 오래 걸린 활동이 막대 길이로 드러난다. */
export function ActivityList({ activities, display, onRecord, onVisiblePurpose }: { activities: Activity[]; display: DisplayText; onRecord: (ref: string) => void; onVisiblePurpose: (purpose: string | null) => void }) {
  const [visible, setVisible] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(null);
  const [failedOnly, setFailedOnly] = useState(false);
  const kinds = useMemo(() => [...new Set(activities.map(kindOf))], [activities]);
  const maxMs = Math.max(1, ...activities.map(activity => activity.elapsedMs ?? 0));
  const shown = activities.filter(activity => (kind === null || kindOf(activity) === kind) && (!failedOnly || statusKind(activity.status) === 'bad'));
  const visiblePurpose = shown.slice(0, visible).find(activity => activity.id === openId)?.purpose ?? null;
  useEffect(() => {
    onVisiblePurpose(visiblePurpose);
    return () => onVisiblePurpose(null);
  }, [visiblePurpose, onVisiblePurpose]);

  if (!activities.length) return <p className="section-empty">이 회차의 세부 활동이 아직 기록되지 않음</p>;
  return <div className="activities">
    <div className="activity-tools">
      <div className="chip-row" role="group" aria-label="활동 종류">
        <button className={`chip${kind === null ? ' is-selected' : ''}`} aria-pressed={kind === null} onClick={() => setKind(null)}>전체</button>
        {kinds.length > 1 && kinds.map(item => <button key={item} className={`chip${kind === item ? ' is-selected' : ''}`} aria-pressed={kind === item} onClick={() => setKind(kind === item ? null : item)}>{item}</button>)}
      </div>
      <button className={`chip${failedOnly ? ' is-selected' : ''}`} aria-pressed={failedOnly} onClick={() => setFailedOnly(value => !value)}>실패만</button>
    </div>
    <p className="events-count num">{shown.length}건{shown.length !== activities.length ? ` / 전체 ${activities.length}건` : ''}</p>
    <ul className="activity-rows">
      {shown.slice(0, visible).map(activity => {
        const open = openId === activity.id;
        const refs = activity.rawRefs ?? [];
        const long = (activity.elapsedMs ?? 0) >= LONG_MS && (activity.elapsedMs ?? 0) >= maxMs / 2;
        return <li key={activity.id} className={`activity${open ? ' is-open' : ''}`}>
          <button className="activity-row" aria-expanded={open} onClick={() => setOpenId(open ? null : activity.id)}>
            <time className="num" dateTime={activity.startedAt ?? undefined}>{activity.startedAt ? clock(activity.startedAt) : <MissingValue label="시각 기록 없음" />}</time>
            <span className="provider-tag">{providerLabel(activity.provider)}</span>
            <span className="activity-title">{activity.title || activity.kind || '개별 활동'}</span>
            <span className="activity-bar" aria-hidden="true"><span className={long ? 'is-long' : ''} style={{ width: `${((activity.elapsedMs ?? 0) / maxMs) * 100}%` }} /></span>
            <span className={`activity-time${long ? ' is-long' : ''}`}><Duration ms={activity.elapsedMs} compact /></span>
            <StatusMark kind={statusKind(activity.status)} size={14} />
          </button>
          {open && <div className="activity-detail">
            {activity.purpose && <p className="activity-purpose">{display(activity.purpose)}</p>}
            <dl className="activity-facts">
              <div><dt>상태</dt><dd>{statusLabel(activity.status)}</dd></div>
              {activity.actor && <div><dt>수행</dt><dd>{activity.actor}</dd></div>}
              <div><dt>시작</dt><dd className="num">{activity.startedAt ? clock(activity.startedAt) : '—'}</dd></div>
              {activity.endedAt && <div><dt>종료</dt><dd className="num">{clock(activity.endedAt)}</dd></div>}
            </dl>
            <div className="preview-pair"><Preview label="입력" text={activity.input} /><Preview label="결과" text={activity.output} /></div>
            <div className="ref-row">{refs.length ? refs.map((ref, index) => <button key={`${ref}-${index}`} className="text-button" title={ref} onClick={() => onRecord(ref)}><Icon name="file" size={14} />{refs.length === 1 ? '원본 기록 보기' : `원본 기록 ${index + 1}`}</button>) : <span className="muted-note">연결된 원본 기록이 없음</span>}</div>
          </div>}
        </li>;
      })}
    </ul>
    {shown.length > visible && <button className="more-button" onClick={() => setVisible(count => count + PAGE)}>활동 {Math.min(PAGE, shown.length - visible)}건 더 보기</button>}
  </div>;
}
