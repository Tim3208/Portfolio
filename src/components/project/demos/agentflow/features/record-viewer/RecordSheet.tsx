import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { RawRecord } from '@/components/project/demos/agentflow/shared/api/contract';
import { requestMonitor } from '@/components/project/demos/agentflow/shared/api/monitor';
import { bytes } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon } from '@/components/project/demos/agentflow/shared/ui/Icon';
import { Disclosure, Keycap } from '@/components/project/demos/agentflow/shared/ui/primitives';

const CHUNK_BYTES = 65536;
const LINE_PAGE = 400;

/** 구간 전체가 JSON 하나로 읽힐 때만 정렬한다. 읽히지 않으면 원문 그대로 둔다. */
function prettyJson(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed || !/^[[{]/u.test(trimmed)) return null;
  try { return JSON.stringify(JSON.parse(trimmed), null, 2); } catch { return null; }
}

/**
 * 원문 보기 시트. 열린 참조의 64KB 구간만 읽으며 줄 번호는 그 구간 안의 번호다.
 * 라이브 갱신과 독립되어 있어 읽거나 선택한 텍스트가 폴링으로 바뀌지 않는다.
 */
export function RecordSheet({ runId, recordRef, onClose }: { runId: string; recordRef: string; onClose: () => void }) {
  const [record, setRecord] = useState<RawRecord | null>(null);
  const [offset, setOffset] = useState(0);
  const [previousOffsets, setPreviousOffsets] = useState<number[]>([]);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [wrap, setWrap] = useState(true);
  const [formatted, setFormatted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [lineLimit, setLineLimit] = useState(LINE_PAGE);
  const dialog = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const reqKey = `${runId}:${recordRef}:${offset}:${retry}`;
  const loading = loadedKey !== reqKey;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);

  useEffect(() => {
    let stopped = false;
    requestMonitor<RawRecord>({ action: 'record', runId, ref: recordRef, offset, limit: CHUNK_BYTES })
      .then(result => { if (!stopped) { setRecord(result); setError(null); setLineLimit(LINE_PAGE); setActive(0); body.current?.scrollTo(0, 0); } })
      .catch(reason => { if (!stopped) setError(reason instanceof Error ? reason.message : String(reason)); })
      .finally(() => { if (!stopped) setLoadedKey(reqKey); });
    return () => { stopped = true; };
  }, [runId, recordRef, offset, retry, reqKey]);

  const json = useMemo(() => record ? prettyJson(record.text) : null, [record]);
  const text = formatted && json ? json : record?.text ?? '';
  const lines = useMemo(() => text.split('\n'), [text]);
  const needle = query.trim().toLowerCase();
  const matches = useMemo(() => needle ? lines.flatMap((line, index) => line.toLowerCase().includes(needle) ? [index] : []) : [], [lines, needle]);
  const matchSet = useMemo(() => new Set(matches), [matches]);
  const current = matches.length ? matches[Math.min(active, matches.length - 1)] : -1;
  const effectiveLineLimit = current >= lineLimit ? Math.ceil((current + 1) / LINE_PAGE) * LINE_PAGE : lineLimit;

  useEffect(() => {
    if (current < 0) return;
    body.current?.querySelector(`[data-line="${current}"]`)?.scrollIntoView({ block: 'center' });
  }, [current, effectiveLineLimit]);

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); return; }
    if (event.key !== 'Tab') return;
    const items = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, summary, [tabindex="0"]');
    if (!items?.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  }

  const end = record ? record.offset + new TextEncoder().encode(record.text).length : 0;
  const hasNext = record?.nextOffset != null && record.nextOffset > offset;

  return <div className="sheet-scrim" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" ref={dialog} tabIndex={-1} onKeyDown={trapFocus}>
      <header className="sheet-head">
        <div className="sheet-heading"><h2 id="sheet-title">원본 기록</h2><code title={recordRef}>{recordRef}</code></div>
        <div className="sheet-actions">
          {json && <button className={`chip${formatted ? ' is-selected' : ''}`} aria-pressed={formatted} onClick={() => setFormatted(value => !value)}>JSON 정렬</button>}
          <button className={`chip${wrap ? ' is-selected' : ''}`} aria-pressed={wrap} onClick={() => setWrap(value => !value)}><Icon name="wrap" size={14} />줄바꿈</button>
          <button className="chip" onClick={copy} disabled={!record}><Icon name="copy" size={14} />{copied ? '복사됨' : '복사'}</button>
          <button className="icon-button" onClick={onClose} aria-label="원본 기록 닫기" title="닫기 (Esc)"><Icon name="close" /></button>
        </div>
      </header>
      <div className="sheet-find">
        <label className="search-field"><Icon name="search" /><input aria-label="이 구간에서 찾기" placeholder="이 구간에서 찾기" value={query} onChange={event => { setQuery(event.target.value); setActive(0); }}
          onKeyDown={event => { if (event.key === 'Enter' && matches.length) { event.preventDefault(); setActive(value => (value + (event.shiftKey ? -1 : 1) + matches.length) % matches.length); } }} /></label>
        {needle && <span className="num find-count">{matches.length ? `${Math.min(active, matches.length - 1) + 1}/${matches.length}` : '결과 없음'}</span>}
        <button className="text-button" disabled={!matches.length} onClick={() => setActive(value => (value - 1 + matches.length) % matches.length)}>이전</button>
        <button className="text-button" disabled={!matches.length} onClick={() => setActive(value => (value + 1) % matches.length)}>다음 <Keycap>Enter</Keycap></button>
      </div>
      {error ? <div className="sheet-error" role="alert"><h3>원본 기록을 불러오지 못했습니다</h3><code>{error}</code><button className="more-button" onClick={() => setRetry(value => value + 1)}>다시 시도</button></div> : <>
        <div className="sheet-body" ref={body} aria-busy={loading}>
          {loading && <p className="sheet-loading" role="status">불러오는 중</p>}
          <ol className={`record-lines${wrap ? ' is-wrap' : ''}`} tabIndex={0} aria-label="원문">
            {lines.slice(0, effectiveLineLimit).map((line, index) => <li key={index} data-line={index} className={needle && matchSet.has(index) ? index === current ? 'is-active' : 'is-match' : undefined}>{line || ' '}</li>)}
          </ol>
          {lines.length > effectiveLineLimit && <button className="more-button" onClick={() => setLineLimit(effectiveLineLimit + LINE_PAGE)}>다음 {Math.min(LINE_PAGE, lines.length - effectiveLineLimit)}줄 표시</button>}
        </div>
        <Disclosure summary="구간 정보">
          <dl className="detail-ids">
            <div><dt>참조</dt><dd><code>{recordRef}</code></dd></div>
            <div><dt>구간</dt><dd className="num">{record ? `${bytes(record.offset)}–${bytes(end)} / 전체 ${bytes(record.totalBytes)}` : '—'}</dd></div>
            <div><dt>표시</dt><dd className="num">{Math.min(effectiveLineLimit, lines.length)} / {lines.length}줄 (이 구간 안의 번호)</dd></div>
          </dl>
        </Disclosure>
        <footer className="sheet-foot">
          <span className="num">{record ? `${bytes(record.offset)}부터 ${bytes(end)}까지 · 전체 ${bytes(record.totalBytes)}` : '연결 중'}</span>
          <span>
            <button className="text-button" disabled={loading || !previousOffsets.length} onClick={() => { setOffset(previousOffsets.at(-1) ?? 0); setPreviousOffsets(previous => previous.slice(0, -1)); }}>이전 구간</button>
            <button className="text-button" disabled={loading || !hasNext} onClick={() => { if (record?.nextOffset != null) { setPreviousOffsets(previous => [...previous, offset]); setOffset(record.nextOffset); } }}>다음 구간</button>
          </span>
        </footer>
      </>}
    </div>
  </div>;
}
