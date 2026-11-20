import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MonitorSnapshot } from '@/components/project/demos/agentflow/shared/api/contract';
import { readPreference, writePreference } from '@/components/project/demos/agentflow/shared/api/preferences';
import { depthOf, emptyPath, followPath, parentPath, resolvePath, type Depth, type FlowTab, type Path } from '@/components/project/demos/agentflow/entities/monitor/model/path';

interface Stored { runId: string | null; path: Path; tab: FlowTab; follow: boolean }
const defaults = (runId: string | null, follow: boolean): Stored => ({ runId, path: emptyPath, tab: 'flow', follow });

/**
 * 탐색 깊이(흐름 → 단계 → 작업 → 회차)와 따라가기를 관리한다.
 * 선택은 ID 경로만 저장하고, 따라가기가 켜져 있으면 저장된 경로 대신 Master 초점에서 매번 계산한다.
 * 현재 실행만 기본으로 따라가며 지난 실행은 가장 위 깊이에서 시작한다.
 */
export function useDrill(snapshot: MonitorSnapshot | null, runId: string | null, isCurrent: boolean) {
  const [stored, setStored] = useState<Stored>(() => readPreference('drill', defaults(null, true)));
  // 실행이 바뀌면 이전 실행의 선택을 가져오지 않는다.
  const state = stored.runId === runId ? stored : defaults(runId, isCurrent);

  useEffect(() => { writePreference('drill', state); }, [state]);

  const path = useMemo(() => state.follow ? followPath(snapshot) : resolvePath(snapshot, state.path), [snapshot, state.follow, state.path]);
  const depth: Depth = depthOf(path);

  const select = useCallback((next: Path) => setStored({ ...state, runId, path: next, follow: false }), [state, runId]);
  const up = useCallback(() => { if (depthOf(path) > 1) setStored({ ...state, runId, path: parentPath(path), follow: false }); }, [state, runId, path]);
  const setTab = useCallback((tab: FlowTab) => setStored({ ...state, runId, tab }), [state, runId]);
  const resumeFollow = useCallback(() => setStored({ ...state, runId, path: emptyPath, follow: true }), [state, runId]);

  return { path, depth, tab: state.tab, follow: state.follow, select, up, setTab, resumeFollow };
}
