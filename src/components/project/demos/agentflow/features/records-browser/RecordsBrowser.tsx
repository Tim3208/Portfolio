import { useEffect, useState } from 'react';
import type { RecordsResult } from '@/components/project/demos/agentflow/shared/api/contract';
import { requestMonitor } from '@/components/project/demos/agentflow/shared/api/monitor';
import { bytes, calendar } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon } from '@/components/project/demos/agentflow/shared/ui/Icon';

/** 요약의 최근 기록 제한과 별개로 실행 원문 전체를 폴더별·페이지별로 탐색한다. */
export function RecordsBrowser({ runId, onRecord }: { runId: string; onRecord: (ref: string) => void }) {
  const [prefix, setPrefix] = useState('raw');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const [result, setResult] = useState<RecordsResult | null>(null);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const reqKey = `${runId}:${prefix}:${cursor ?? ''}:${search}:${refresh}`;
  const loading = loadedKey !== reqKey;

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(query); setCursor(undefined); setCursorHistory([]); }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let stopped = false;
    requestMonitor<RecordsResult>({ action: 'records', runId, prefix, cursor, limit: 100, query: search })
      .then(value => { if (!stopped) { setResult(value); setError(null); } })
      .catch(reason => { if (!stopped) setError(reason instanceof Error ? reason.message : String(reason)); })
      .finally(() => { if (!stopped) setLoadedKey(reqKey); });
    return () => { stopped = true; };
  }, [runId, prefix, cursor, search, refresh, reqKey]);

  function openFolder(value: string) { setPrefix(value); setCursor(undefined); setCursorHistory([]); }
  const parts = prefix.split('/').filter(Boolean);

  return <div className="records">
    <div className="records-tools">
      <nav className="record-path" aria-label="원본 기록 폴더">
        <button onClick={() => openFolder('')}>전체 기록</button>
        {parts.map((part, index) => <span key={`${part}-${index}`}><Icon name="chevron" size={12} /><button onClick={() => openFolder(parts.slice(0, index + 1).join('/'))}>{part}</button></span>)}
      </nav>
      <label className="search-field"><Icon name="search" /><input aria-label="현재 폴더의 기록 이름 검색" placeholder="이름 검색" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <button className="icon-button" onClick={() => setRefresh(value => value + 1)} aria-label="원본 기록 목록 새로 확인" title="새로 확인"><Icon name="refresh" /></button>
    </div>
    {error ? <div className="records-error" role="alert"><p>원본 기록 목록을 불러오지 못했습니다</p><code>{error}</code><button className="text-button" onClick={() => setRefresh(value => value + 1)}>다시 시도</button></div>
      : <ul className="records-list" aria-busy={loading}>
        {result?.entries.map(entry => <li key={entry.ref}>
          <button className="record-entry" title={entry.ref} onClick={() => entry.kind === 'directory' ? openFolder(entry.ref) : onRecord(entry.ref)}>
            <Icon name={entry.kind === 'directory' ? 'folder' : 'file'} />
            <span className="record-name">{entry.name}</span>
            <span className="record-modified num">{entry.modifiedAt ? calendar(entry.modifiedAt) : ''}</span>
            <span className="record-size num">{entry.kind === 'directory' ? '폴더' : entry.size == null ? '—' : bytes(entry.size)}</span>
          </button>
        </li>)}
        {loading && <li className="records-note" role="status">목록을 불러오는 중</li>}
        {!loading && !result?.entries.length && <li className="records-note">{search ? '검색한 이름의 기록이 없음' : '이 폴더에 기록이 없음'}</li>}
      </ul>}
    <footer className="records-foot">
      <span className="num">{result?.total == null ? '' : `${result.total}개 항목`}</span>
      <span>
        <button className="text-button" disabled={loading || !cursorHistory.length} onClick={() => { setCursor(cursorHistory.at(-1)); setCursorHistory(previous => previous.slice(0, -1)); }}>이전 목록</button>
        <button className="text-button" disabled={loading || !result?.nextCursor} onClick={() => { if (result?.nextCursor) { setCursorHistory(previous => [...previous, cursor]); setCursor(result.nextCursor); } }}>다음 목록</button>
      </span>
    </footer>
  </div>;
}
