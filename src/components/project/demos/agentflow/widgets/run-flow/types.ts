import type { MonitorSnapshot } from '@/components/project/demos/agentflow/shared/api/contract';
import type { Path } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import type { DisplayText } from '@/components/project/demos/agentflow/features/view-language/projection';

/** 모든 깊이 화면이 공유하는 입력. 화면은 snapshot을 읽기만 하고 이동·원문 열기는 콜백으로 요청한다. */
export interface RunViewProps {
  snapshot: MonitorSnapshot;
  nowMs: number;
  /** 진행 중이고 연결이 살아 있을 때만 true. false이면 시계가 멈춘 값으로 표시한다. */
  live: boolean;
  display: DisplayText;
  onSelect: (path: Path) => void;
  onRecord: (ref: string) => void;
}
