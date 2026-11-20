/**
 * 원본: Tim3208/agentflow-skills @ 3eb3c16 (apps/agentflow-monitor/src/pages/monitor/MonitorPage.tsx)
 * 변경점:
 * - 포트폴리오의 단일 <main#content> 계약을 지키기 위해 내부 <main>을 <div role="region">으로 바꿈
 * - 전역 window keydown 대신 .afm-root 범위의 onKeyDown 으로 단축키를 제한
 * - 샘플 시나리오 전환 prop(scenario)을 받아 useMonitor 초기값으로 전달
 */
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { currentRunAvailability } from "@/components/project/demos/agentflow/entities/monitor/model/discovery";
import { useMonitor } from "@/components/project/demos/agentflow/entities/monitor/model/useMonitor";
import { useDrill } from "@/components/project/demos/agentflow/features/drill-navigation/model/useDrill";
import { RecordSheet } from "@/components/project/demos/agentflow/features/record-viewer/RecordSheet";
import { LanguageToolbar } from "@/components/project/demos/agentflow/features/view-language/LanguageToolbar";
import { projectViewLanguage } from "@/components/project/demos/agentflow/features/view-language/projection";
import { useViewLanguage } from "@/components/project/demos/agentflow/features/view-language/useViewLanguage";
import type { TimelineEvent } from "@/components/project/demos/agentflow/shared/api/contract";
import { clock } from "@/components/project/demos/agentflow/shared/lib/format";
import { useNow } from "@/components/project/demos/agentflow/shared/lib/timeline";
import { Icon } from "@/components/project/demos/agentflow/shared/ui/Icon";
import { EmptyState } from "@/components/project/demos/agentflow/shared/ui/primitives";
import { AppBar, Banner, CrumbBar, StatusBar, type ConnectionState } from "@/components/project/demos/agentflow/widgets/app-chrome/AppChrome";
import { AttemptView } from "@/components/project/demos/agentflow/widgets/attempt-view/AttemptView";
import { DepthRail } from "@/components/project/demos/agentflow/widgets/depth-rail/DepthRail";
import { NowBar } from "@/components/project/demos/agentflow/widgets/now-bar/NowBar";
import { RunFlow } from "@/components/project/demos/agentflow/widgets/run-flow/RunFlow";
import { RunSwitcher } from "@/components/project/demos/agentflow/widgets/run-switcher/RunSwitcher";
import { StageView } from "@/components/project/demos/agentflow/widgets/stage-view/StageView";
import { TaskView } from "@/components/project/demos/agentflow/widgets/task-view/TaskView";
import "../../monitor.css";

/** 화면 뼈대만 조립한다. 지금 줄은 항상 보이고, 본문은 한 번에 한 깊이만 보여 준다. */
export function MonitorPage({ scenario = "live" }: { scenario?: "live" | "done" }) {
  const monitor = useMonitor(scenario);
  const { discovery, error, selectedRunId } = monitor;
  const snapshot = monitor.snapshot?.run.id === selectedRunId ? monitor.snapshot : null;
  const isCurrent = monitor.view === "current";
  const drill = useDrill(snapshot, selectedRunId, isCurrent);
  const [recordRef, setRecordRef] = useState<string | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<{ runId: string; events: readonly TimelineEvent[] } | null>(null);
  const [visibleActivity, setVisibleActivity] = useState<{ runId: string; attemptId: string; purpose: string | null } | null>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const availability = currentRunAvailability(discovery);

  const connection: ConnectionState =
    error || (!snapshot && availability.kind === "unavailable")
      ? "offline"
      : monitor.discovering || (monitor.loading && !snapshot)
        ? "connecting"
        : "connected";
  const live = Boolean(snapshot?.run.active) && !error;
  const nowMs = useNow();
  const { path, depth } = drill;
  const pathKey = `${selectedRunId}/${path.stageId}/${path.taskId}/${path.attemptId}`;
  const languageProjection = useMemo(
    () =>
      projectViewLanguage(
        snapshot,
        path,
        drill.tab,
        visibleEvents && visibleEvents.runId === snapshot?.run.id ? visibleEvents.events : [],
        visibleActivity && visibleActivity.runId === snapshot?.run.id && visibleActivity.attemptId === path.attemptId
          ? visibleActivity.purpose
          : null,
      ),
    [snapshot, path, drill.tab, visibleEvents, visibleActivity],
  );
  const languageScope = snapshot ? JSON.stringify([snapshot.run.id, path, depth === 1 ? drill.tab : null]) : "";
  const language = useViewLanguage(languageScope, languageProjection);

  useEffect(() => {
    focusRef.current?.scrollTo(0, 0);
  }, [pathKey, drill.tab]);

  const openCurrent = useCallback(() => {
    setRecordRef(null);
    monitor.openCurrent();
    drill.resumeFollow();
    setSwitcherOpen(false);
  }, [monitor, drill]);

  function openHistory(runId: string) {
    setRecordRef(null);
    monitor.openHistory(runId);
    setSwitcherOpen(false);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.altKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      openCurrent();
    } else if (event.altKey && event.key.toLowerCase() === "h") {
      event.preventDefault();
      setSwitcherOpen((value) => !value);
    } else if (event.key === "Escape" && !event.defaultPrevented) {
      if (recordRef) setRecordRef(null);
      else drill.up();
    }
  }

  const view = snapshot && { snapshot, nowMs, live, display: language.display, onSelect: drill.select, onRecord: setRecordRef };
  const switcher = (
    <RunSwitcher
      runs={discovery.runs}
      currentRunId={discovery.currentRunId}
      selectedRunId={selectedRunId}
      isCurrent={isCurrent}
      currentPlaceholder={error ? "기록 연결 확인 필요" : monitor.discovering ? "실행 확인 중" : availability.header}
      open={switcherOpen}
      onOpenChange={setSwitcherOpen}
      onCurrent={openCurrent}
      onHistory={openHistory}
      display={language.display}
    />
  );

  return (
    <div className="afm-root" onKeyDown={handleKeyDown}>
      <div className="app-shell">
        <AppBar switcher={switcher} connection={connection} onRefresh={monitor.refresh} />
        {!isCurrent && (
          <Banner tone="neutral" action={{ label: "현재 실행으로 돌아가기 (Alt+C)", onClick: openCurrent }}>
            {snapshot?.run.active ? "선택한 실행을 보는 중" : "지난 실행을 보는 중"}
          </Banner>
        )}
        {error && (
          <Banner tone="wait" action={{ label: "다시 확인", onClick: monitor.refresh }}>
            연결이 끊겨 {monitor.updatedAt ? `${clock(monitor.updatedAt)} 기준 정보를 보여 주는 중` : "기록을 받지 못함"}
          </Banner>
        )}

        {snapshot && view ? (
          <>
            <NowBar
              snapshot={snapshot}
              nowMs={nowMs}
              live={live}
              display={language.display}
              showStrip={depth > 1}
              onFollow={drill.resumeFollow}
              onSelect={drill.select}
            />
            <CrumbBar
              snapshot={snapshot}
              path={path}
              display={language.display}
              follow={drill.follow}
              canFollow={snapshot.run.active}
              onSelect={drill.select}
              onFollow={drill.resumeFollow}
              onUp={drill.up}
            />
            <div className={`shell-body${depth > 1 ? " has-rail" : ""}`}>
              {depth > 1 && (
                <DepthRail snapshot={snapshot} path={path} depth={depth} display={language.display} onSelect={drill.select} />
              )}
              <div className="focus" ref={focusRef} role="region" aria-label="상세 내용" tabIndex={-1}>
                <LanguageToolbar language={language} />
                {depth === 1 && <RunFlow {...view} tab={drill.tab} onTab={drill.setTab} onVisibleEvents={setVisibleEvents} />}
                {depth === 2 && path.stageId && <StageView {...view} stageId={path.stageId} />}
                {depth === 3 && path.taskId && <TaskView {...view} taskId={path.taskId} />}
                {depth === 4 && path.taskId && path.attemptId && (
                  <AttemptView
                    {...view}
                    taskId={path.taskId}
                    attemptId={path.attemptId}
                    onVisibleActivity={setVisibleActivity}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="focus is-empty" role="region" aria-label="상세 내용">
            <EmptyState icon="flow" title={availability.title} description={availability.description}>
              <button className="more-button" onClick={monitor.refresh}>
                <Icon name="refresh" size={14} /> 다시 확인
              </button>
            </EmptyState>
          </div>
        )}

        <StatusBar connection={connection} updatedAt={monitor.updatedAt} />
        {recordRef && selectedRunId && (
          <RecordSheet key={`${selectedRunId}/${recordRef}`} runId={selectedRunId} recordRef={recordRef} onClose={() => setRecordRef(null)} />
        )}
      </div>
    </div>
  );
}
