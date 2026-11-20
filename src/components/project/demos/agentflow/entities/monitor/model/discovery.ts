import type { Discovery } from '@/components/project/demos/agentflow/shared/api/contract';

/**
 * 조회에 성공한 미완료 기록과 조회 문제를 구분한다. 현재 연결이 없다는 사실만으로 실행 부재를 단정하지 않으며,
 * 여러 기록 중 최신 항목을 현재 실행으로 추정하지 않는다.
 */
export function currentRunAvailability(discovery: Discovery) {
  const activeCount = discovery.runs.filter(run => run.active).length;
  if (discovery.currentRunId && discovery.runs.some(run => run.id === discovery.currentRunId)) {
    return { kind: 'ready' as const, title: '', description: '', header: '현재 실행', selectable: false };
  }
  if (activeCount > 0) {
    return {
      kind: 'unselected' as const,
      title: '현재 실행을 선택해 주세요',
      description: activeCount > 1
        ? `미완료 실행 기록이 ${activeCount}개 있어 현재 작업을 자동으로 확인하지 못했습니다. 실행 목록에서 확인할 작업을 선택해 주세요.`
        : '미완료 실행 기록이 있지만 현재 작업과 연결되지 않았습니다. 실행 목록에서 확인할 작업을 선택해 주세요.',
      header: '실행 선택 필요', selectable: true,
    };
  }
  if (discovery.issues.length > 0) {
    return {
      kind: 'unavailable' as const,
      title: '현재 실행 기록을 확인하지 못했습니다',
      description: '기록 연결을 확인해야 하므로 실행 여부를 알 수 없습니다. 연결 안내를 확인한 뒤 다시 시도해 주세요.',
      header: '기록 연결 확인 필요', selectable: discovery.runs.length > 0,
    };
  }
  return {
    kind: 'empty' as const,
    title: '등록된 진행 중 실행이 없습니다',
    description: '새 실행의 기록이 등록되면 진행 과정이 여기에 표시됩니다.',
    header: '등록된 진행 중 실행 없음', selectable: false,
  };
}
