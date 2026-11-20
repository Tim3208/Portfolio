/** 기록된 시간만 표시한다. 아직 계측되지 않은 값은 0으로 바꾸지 않는다. */
export function duration(milliseconds: number | null | undefined, compact = false): string {
  if (milliseconds == null || !Number.isFinite(milliseconds)) return '—';
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours) return compact ? `${hours}시간 ${minutes}분` : `${hours}시간 ${minutes}분 ${remainder}초`;
  if (minutes) return compact ? `${minutes}분` : `${minutes}분 ${String(remainder).padStart(2, '0')}초`;
  return `${remainder}초`;
}

export function clock(value?: string | null): string {
  if (!value || Number.isNaN(Date.parse(value))) return '시각 미기록';
  return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(value));
}

export function calendar(value?: string | null): string {
  if (!value || Number.isNaN(Date.parse(value))) return '날짜 미기록';
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
}

/** 상태 이름은 사용자 언어로 번역하고 알려지지 않은 상태는 원문을 보존한다. */
const labels: Record<string, string> = {
  ACTIVE: '진행 중', RUNNING: '실행 중', STARTED: '시작됨', SELECTED: '배정됨',
  COMPLETE: '완료', COMPLETED: '완료', DONE: '완료', ENDED: '종료', PASS: '통과', PASSED: '통과',
  WAITING: '대기 중', WAITING_USER: '답변 대기', WAITING_REVIEW: '검토 대기', WAITING_QUOTA: '사용량 대기', WAITING_QA: '검증 대기',
  QUOTA_WAIT: '사용량 대기', WAITING_MASTER: '판단 대기', MASTER_REVIEW: '판단 대기',
  FAILED: '실패', FAIL: '실패', ERROR: '오류', BLOCKED: '진행 막힘', NEEDS_INFO: '추가 정보 필요',
  PENDING: '예정', READY: '준비됨', PLANNED: '예정', NOT_STARTED: '예정', IN_PROGRESS: '진행 중',
  CANCELLED: '취소됨', CANCELED: '취소됨', INTERRUPTED: '중단됨', STOPPED: '중단됨', SKIPPED: '건너뜀',
  REQUEST: '요청', PLANNING: '기획', DEVELOPMENT: '개발', QA: 'QA', WIKI: 'Wiki', ORCHESTRATION: '진행 관리',
  UNKNOWN: '기록 확인 필요', INCOMPLETE: '일부 기록',
  TODO: '예정', SUBMITTED: '제출됨', UNFINISHED: '끝이 기록되지 않음', FINALIZE: '마무리',
};

export function statusLabel(value?: string | null): string {
  if (!value) return '상태 미기록';
  return labels[value.toUpperCase().replaceAll('-', '_')] ?? value;
}

export function statusTone(value?: string | null): 'good' | 'live' | 'wait' | 'bad' | 'quiet' {
  const key = value?.toUpperCase().replaceAll('-', '_') ?? '';
  if (['FAIL', 'FAILED', 'ERROR', 'BLOCKED', 'REJECTED'].includes(key)) return 'bad';
  if (['WAITING', 'WAITING_USER', 'WAITING_REVIEW', 'WAITING_QUOTA', 'WAITING_QA', 'QUOTA_WAIT', 'WAITING_MASTER', 'MASTER_REVIEW', 'NEEDS_INFO'].includes(key)) return 'wait';
  if (['COMPLETE', 'COMPLETED', 'DONE', 'PASS', 'PASSED'].includes(key)) return 'good';
  if (['ACTIVE', 'RUNNING', 'STARTED', 'IN_PROGRESS'].includes(key)) return 'live';
  return 'quiet';
}

export type StatusKind = 'live' | 'good' | 'wait' | 'bad' | 'pending' | 'unknown';

const PENDING = new Set(['PENDING', 'READY', 'PLANNED', 'NOT_STARTED', 'TODO', 'SELECTED', 'SKIPPED']);

/** 표시 모양을 정하는 분류. 아직 시작하지 않은 상태와 기록이 불완전한 상태를 서로 다른 모양으로 구분한다. */
export function statusKind(value?: string | null): StatusKind {
  const tone = statusTone(value);
  if (tone !== 'quiet') return tone;
  return PENDING.has(value?.toUpperCase().replaceAll('-', '_') ?? '') ? 'pending' : 'unknown';
}

export function providerLabel(value?: string | null): string {
  if (!value) return 'AgentFlow';
  return value.toLowerCase() === 'claude' ? 'Claude' : value.toLowerCase() === 'codex' ? 'Codex' : value;
}

export function roleLabel(value: unknown): string {
  if (typeof value !== 'string') return '';
  return ({ master: 'Master', planner: '기획 담당', developer: '개발 담당', reviewer: '검토 담당', qa: 'QA 담당', wiki: '문서 담당' } as Record<string, string>)[value] ?? value;
}

/** 마지막 기록이 얼마나 오래되었는지. 시각을 모르면 null을 돌려 호출한 쪽이 미기록으로 표시하게 한다. */
export function ago(milliseconds: number | null | undefined): string | null {
  if (milliseconds == null || !Number.isFinite(milliseconds)) return null;
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  if (seconds < 60) return `${seconds}초 전`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  return `${Math.floor(seconds / 3600)}시간 전`;
}

export function bytes(value: number): string {
  return value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : value >= 1024 ? `${(value / 1024).toFixed(1)} KB` : `${value} B`;
}
