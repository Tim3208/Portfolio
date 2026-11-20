import { useMemo } from 'react';
import type { MonitorSnapshot } from '@/components/project/demos/agentflow/shared/api/contract';
import { duration, providerLabel, roleLabel, statusKind } from '@/components/project/demos/agentflow/shared/lib/format';
import { NavList, type NavItem } from '@/components/project/demos/agentflow/shared/ui/NavList';
import { MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusMark } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import { attemptLabel, tasksOfStage, visibleStages, type Depth, type Path } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import type { DisplayText } from '@/components/project/demos/agentflow/features/view-language/projection';

const Sub = ({ children }: { children: React.ReactNode }) => <span className="rail-sub num">{children}</span>;

/** 현재 깊이의 형제 항목 목록. 한 단계 올라가지 않고도 옆 항목으로 바로 옮길 수 있다. 가장 위 깊이에서는 쓰지 않는다. */
export function DepthRail({ snapshot, path, depth, display, onSelect }: { snapshot: MonitorSnapshot; path: Path; depth: Depth; display: DisplayText; onSelect: (path: Path) => void }) {
  const model = useMemo(() => {
    if (depth === 2) {
      const stages = visibleStages(snapshot);
      return {
        title: '단계', count: stages.length,
        items: stages.map((stage): NavItem => {
          const tasks = tasksOfStage(snapshot, stage.id);
          const done = tasks.filter(task => statusKind(task.status) === 'good').length;
          return { id: stage.id, selected: stage.id === path.stageId, title: display(stage.label),
            content: <><StatusMark kind={statusKind(stage.status)} /><span className="rail-text"><span className="rail-title">{display(stage.label)}</span><Sub>{tasks.length ? `작업 ${done}/${tasks.length}` : '작업 없음'} · {stage.elapsedMs == null ? '—' : duration(stage.elapsedMs, true)}</Sub></span></> };
        }),
        pick: (id: string): Path => ({ stageId: id, taskId: null, attemptId: null }),
      };
    }
    if (depth === 3) {
      const tasks = tasksOfStage(snapshot, path.stageId ?? '');
      return {
        title: `${display(snapshot.stages.find(stage => stage.id === path.stageId)?.label ?? '')} 작업`, count: tasks.length,
        items: tasks.map((task): NavItem => ({ id: task.id, selected: task.id === path.taskId, title: display(task.title),
          content: <><StatusMark kind={statusKind(task.status)} /><span className="rail-text"><span className="rail-title">{display(task.title)}</span><Sub>{task.elapsedMs == null ? '—' : duration(task.elapsedMs, true)}{task.attemptCount > 0 ? ` · 시도 ${task.attemptCount}` : ''}</Sub></span></> })),
        pick: (id: string): Path => ({ stageId: path.stageId, taskId: id, attemptId: null }),
      };
    }
    const task = snapshot.tasks.find(item => item.id === path.taskId);
    return {
      title: task ? `${display(task.title)} 회차` : '회차', count: task?.attempts.length ?? 0,
      items: (task?.attempts ?? []).map((attempt): NavItem => ({ id: attempt.id, selected: attempt.id === path.attemptId, title: task ? attemptLabel(task, attempt) : attempt.id,
        content: <><StatusMark kind={statusKind(attempt.status)} /><span className="rail-text"><span className="rail-title">{task ? attemptLabel(task, attempt) : attempt.id}</span><Sub>{attempt.role === 'reviewer' ? 'Claude' : providerLabel(attempt.provider)} · {roleLabel(attempt.role)} · {attempt.elapsedMs == null ? '—' : duration(attempt.elapsedMs, true)}</Sub></span></> })),
      pick: (id: string): Path => ({ stageId: path.stageId, taskId: path.taskId, attemptId: id }),
    };
  }, [snapshot, path, depth, display]);

  return <nav className="rail" aria-label={`${model.title} 목록`}>
    <h2 className="rail-head"><span>{model.title}</span><span className="num">{model.count}</span></h2>
    {model.items.length ? <NavList label={model.title} items={model.items} onSelect={id => onSelect(model.pick(id))} /> : <p className="rail-empty"><MissingValue label="기록 없음" /> 이 깊이의 항목이 없음</p>}
  </nav>;
}
