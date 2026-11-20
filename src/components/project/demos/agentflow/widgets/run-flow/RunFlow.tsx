import { calendar } from '@/components/project/demos/agentflow/shared/lib/format';
import { Tabs, TabPanel, type TabItem } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusBadge } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import { RecordsBrowser } from '@/components/project/demos/agentflow/features/records-browser/RecordsBrowser';
import { flowTabs, type FlowTab } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import type { TimelineEvent } from '@/components/project/demos/agentflow/shared/api/contract';
import { EventsTab } from './EventsTab';
import { FlowTab as FlowPanel } from './FlowTab';
import { RequirementsTab } from './RequirementsTab';
import { TimeTab } from './TimeTab';
import type { RunViewProps } from './types';

const PREFIX = 'flow';

/** 가장 위 깊이. 실행 전체를 다섯 가지 관점(흐름·시간·요구사항·사건·원본) 중 하나씩 본다. */
export function RunFlow(props: RunViewProps & { tab: FlowTab; onTab: (tab: FlowTab) => void; onVisibleEvents: (selection: { runId: string; events: readonly TimelineEvent[] }) => void }) {
  const { snapshot, tab, onTab, display } = props;
  const { run } = snapshot;
  const items: TabItem<FlowTab>[] = flowTabs.map(item => ({
    ...item,
    count: item.id === 'requirements' ? snapshot.requirements.length : item.id === 'events' ? snapshot.totals.events : null,
  }));
  return <div className="view run-flow">
    <header className="view-head">
      <div className="view-title-row"><h3 className="view-title">{display(run.title) || '제목 없는 실행'}</h3><StatusBadge status={run.active ? 'ACTIVE' : run.status} /></div>
      <p className="view-sub">
        <span>시작 <time className="num" dateTime={run.createdAt ?? undefined}>{calendar(run.createdAt)}</time></span>
        {run.endedAt && <span>종료 <time className="num" dateTime={run.endedAt}>{calendar(run.endedAt)}</time></span>}
        {run.projectName && <span>{display(run.projectName)}</span>}
      </p>
    </header>
    {snapshot.warnings.length > 0 && <details className="notices"><summary>기록 안내 {snapshot.warnings.length}건</summary><ul>{snapshot.warnings.map((warning, index) => <li key={index}>{typeof warning === 'string' ? warning : JSON.stringify(warning)}</li>)}</ul></details>}
    <Tabs items={items} value={tab} onChange={onTab} label="실행 보기" idPrefix={PREFIX} />
    <TabPanel idPrefix={PREFIX} tab={tab}>
      {tab === 'flow' && <FlowPanel {...props} />}
      {tab === 'time' && <TimeTab {...props} />}
      {tab === 'requirements' && <RequirementsTab {...props} />}
      {tab === 'events' && <EventsTab {...props} />}
      {tab === 'records' && <RecordsBrowser runId={run.id} onRecord={props.onRecord} />}
    </TabPanel>
  </div>;
}
