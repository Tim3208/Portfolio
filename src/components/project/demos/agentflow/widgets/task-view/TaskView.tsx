import { useId, useMemo, useState } from 'react';
import type { Assignment, Review, Task } from '@/components/project/demos/agentflow/shared/api/contract';
import { clock, providerLabel, roleLabel, statusKind, statusLabel } from '@/components/project/demos/agentflow/shared/lib/format';
import { Icon } from '@/components/project/demos/agentflow/shared/ui/Icon';
import { Disclosure, Duration, MissingValue } from '@/components/project/demos/agentflow/shared/ui/primitives';
import { StatusBadge, StatusMark } from '@/components/project/demos/agentflow/shared/ui/StatusMark';
import { TimeStrip } from '@/components/project/demos/agentflow/shared/ui/TimeStrip';
import { assignmentSegments, packRows, rangeOf, taskChain } from '@/components/project/demos/agentflow/entities/monitor/model/selectors';
import { attemptLabel } from '@/components/project/demos/agentflow/entities/monitor/model/path';
import type { DisplayText } from '@/components/project/demos/agentflow/features/view-language/projection';
import type { RunViewProps } from '@/components/project/demos/agentflow/widgets/run-flow/types';

/** 긴 목적은 원문을 그대로 두고 접어 두어 시간·회차를 먼저 볼 수 있게 한다. */
function Purpose({ purpose }: { purpose?: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const long = Boolean(purpose && (purpose.length > 180 || purpose.split('\n').length > 3));
  return <section className="purpose" aria-labelledby={`${id}-h`}>
    <h2 id={`${id}-h`} className="section-title">왜 필요한가요</h2>
    {purpose
      ? <p id={id} className={`purpose-text${long && !expanded ? ' is-clamped' : ''}`}>{purpose}</p>
      : <p className="purpose-text is-missing">목적이 기록되지 않음</p>}
    {long && <button className="text-button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>{expanded ? '접기' : '전체 보기'}</button>}
  </section>;
}

function verdictText(verdict: string | null): string {
  const value = verdict?.toUpperCase();
  return value === 'PASS' ? '통과' : value === 'FAIL' ? '수정 요청' : value === 'BLOCKED' ? '진행 막힘' : value === 'NEEDS_INFO' ? '추가 정보 필요' : statusLabel(verdict);
}

function ReviewMarker({ review, display, onRecord }: { review: Review; display: DisplayText; onRecord: (ref: string) => void }) {
  const kind = statusKind(review.verdict);
  const topics = review.findings.flatMap(item => item.topic ? [display(item.topic)] : []);
  return <li className={`chain-review is-${kind}`}>
    <span className="chain-mark"><Icon name="repeat" size={14} /></span>
    <div className="chain-review-body">
      <p><strong>검토 결과 · {verdictText(review.verdict)}</strong>{review.at && <time className="num" dateTime={review.at}> {clock(review.at)}</time>}</p>
      {review.summary && <p className="chain-summary">{display(review.summary)}</p>}
      {topics.length > 0 && <p className="chain-topics">지적 주제 · {topics.join(', ')}</p>}
      {review.rawRefs.length > 0 && <span className="chain-refs">{review.rawRefs.map((ref, index) => <button key={ref} className="text-button" title={ref} onClick={() => onRecord(ref)}><Icon name="file" size={14} />검토 원문{review.rawRefs.length > 1 ? ` ${index + 1}` : ''}</button>)}</span>}
    </div>
  </li>;
}

function AttemptNode({ task, attempt, onOpen }: { task: Task; attempt: Assignment; onOpen: () => void }) {
  return <li className="chain-attempt">
    <span className="chain-mark"><StatusMark kind={statusKind(attempt.status)} /></span>
    <button className="chain-attempt-body" onClick={onOpen}>
      <span className="chain-attempt-title">{attemptLabel(task, attempt)}<span className="chain-attempt-state">{statusLabel(attempt.status)}</span></span>
      <span className="chain-attempt-meta">{attempt.role === 'reviewer' ? 'Claude' : providerLabel(attempt.provider)} · {roleLabel(attempt.role)}{attempt.startedAt ? <> · <time className="num" dateTime={attempt.startedAt}>{clock(attempt.startedAt)}</time> 시작</> : ' · 시작 시각 기록 없음'}</span>
      <Duration ms={attempt.elapsedMs} compact />
    </button>
  </li>;
}

/** 작업 한 건의 이유·요구사항·진행 순서. 실행과 검토가 어떤 순서로 반복되었는지 체인으로 보여 준다. */
export function TaskView({ snapshot, nowMs, live, taskId, display, onSelect, onRecord }: RunViewProps & { taskId: string }) {
  const task = snapshot.tasks.find(item => item.id === taskId);
  const segments = useMemo(() => task ? assignmentSegments(snapshot, item => task.attempts.some(attempt => attempt.id === item.id), display) : [], [snapshot, task, display]);
  if (!task) return null;
  const axis = rangeOf(segments, live ? nowMs : null);
  const chain = taskChain(task);
  const open = (attempt: Assignment) => onSelect({ stageId: task.stage, taskId: task.id, attemptId: attempt.id });
  const cases = task.cases ?? [];

  return <div className="view task-view">
    <header className="view-head">
      <div className="view-title-row"><h3 className="view-title">{display(task.title)}</h3><StatusBadge status={task.status} /></div>
      <dl className="facts">
        <div><dt>경과</dt><dd><Duration ms={task.elapsedMs} /></dd></div>
        <div><dt>시도</dt><dd className="num">{task.attemptCount}회</dd></div>
        <div><dt>검토</dt><dd className="num">{task.reviewCount}회</dd></div>
        <div><dt>재시도</dt><dd className="num">{task.retryCount}회</dd></div>
      </dl>
    </header>

    <Purpose key={task.id} purpose={task.purpose ? display(task.purpose) : null} />

    {axis && segments.length > 0 && <section aria-label="작업 시간 막대"><TimeStrip axis={axis} nowMs={live ? nowMs : null} rows={packRows(segments)} rowHeight={12} labels label={`${display(task.title)} 시간 막대`} onSelect={onSelect} /></section>}

    <section>
      <h2 className="section-title">진행 순서</h2>
      {chain.length ? <ol className="chain">
        {chain.map(item => item.type === 'attempt'
          ? <AttemptNode key={item.attempt.id} task={task} attempt={item.attempt} onOpen={() => open(item.attempt)} />
          : <ReviewMarker key={item.review.id} review={item.review} display={display} onRecord={onRecord} />)}
      </ol> : <p className="section-empty">아직 실행 기록이 없음</p>}
    </section>

    {task.acceptance && <section><h2 className="section-title">완료 기준</h2><p className="body-text">{display(task.acceptance)}</p></section>}

    {task.requirements.length > 0 && <section>
      <h2 className="section-title">연결된 요구사항</h2>
      <ul className="req-links">{task.requirements.map(requirement => <li key={requirement.id}><span>{display(requirement.description) || <MissingValue label="설명 기록 없음" />}</span><code>{requirement.id}</code></li>)}</ul>
    </section>}



    {cases.length > 0 && <section>
      <h2 className="section-title">검증 케이스</h2>
      <ul className="case-list">{cases.map((item, index) => {
        const label = item.title ?? item.name;
        return <li key={index}><StatusMark kind={statusKind(item.verdict)} /><span>{typeof label === 'string' ? display(label) : String(item.id ?? `케이스 ${index + 1}`)}</span><span className="case-verdict">{statusLabel(item.verdict)}</span></li>;
      })}</ul>
    </section>}

    {task.sourceRefs.length > 0 && <section>
      <h2 className="section-title">연결된 기록</h2>
      <div className="ref-row">{task.sourceRefs.map((ref, index) => <button key={ref} className="text-button" title={ref} onClick={() => onRecord(ref)}><Icon name="file" size={14} />기록 {index + 1}</button>)}</div>
    </section>}

    <Disclosure summary="세부 정보">
      <dl className="detail-ids">
        <div><dt>작업 ID</dt><dd><code>{task.id}</code></dd></div>
        <div><dt>단계</dt><dd><code>{task.stage}</code></dd></div>
        {task.requirementIds.length > 0 && <div><dt>요구사항 ID</dt><dd><code>{task.requirementIds.join(', ')}</code></dd></div>}
      </dl>
    </Disclosure>
  </div>;
}

