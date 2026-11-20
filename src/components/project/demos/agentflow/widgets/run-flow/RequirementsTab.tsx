import { statusKind } from '@/components/project/demos/agentflow/shared/lib/format';
import { MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusMark } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import { requirementProgress, type RequirementState } from '@/components/project/demos/agentflow/entities/monitor/model/selectors';
import type { StatusKind } from '@/components/project/demos/agentflow/shared/lib/format';
import type { RunViewProps } from './types';

const markOf: Record<RequirementState, StatusKind> = { done: 'good', failed: 'bad', progress: 'live', unlinked: 'unknown' };
const textOf: Record<RequirementState, string> = { done: '충족', failed: '실패한 작업 있음', progress: '진행 중', unlinked: '연결된 작업 없음' };

/** 요구사항별로 연결된 작업의 상태를 모아 충족 여부를 보여 준다. 연결 기록이 없으면 충족으로 간주하지 않는다. */
export function RequirementsTab({ snapshot, display, onSelect }: RunViewProps) {
  if (!snapshot.requirements.length) return <p className="section-empty"><MissingValue /> 기록된 요구사항이 없음</p>;
  return <ul className="req-list">
    {snapshot.requirements.map(requirement => {
      const progress = requirementProgress(requirement, snapshot);
      return <li className="req" key={requirement.id}>
        <header>
          <StatusMark kind={markOf[progress.state]} />
          <p className="req-text">{display(requirement.description) || <MissingValue label="설명 기록 없음" />}</p>
          <span className="req-state">{textOf[progress.state]}{progress.total ? <span className="num"> · {progress.done}/{progress.total}</span> : null}</span>
        </header>
        <p className="req-meta"><code>{requirement.id}</code>{requirement.acceptance ? <span>완료 기준 · {display(requirement.acceptance)}</span> : null}</p>
        {progress.tasks.length > 0 && <ul className="req-tasks" aria-label="연결된 작업">
          {progress.tasks.map(task => <li key={task.id}><button className="link-button" onClick={() => onSelect({ stageId: task.stage, taskId: task.id, attemptId: null })}><StatusMark kind={statusKind(task.status)} size={12} />{display(task.title)}</button></li>)}
        </ul>}
      </li>;
    })}
  </ul>;
}
