"use client";

import { useId, useState } from "react";

import { RadioChoices } from "@/components/ui/Switcher";

import { DeferredDemoFrame } from "./shell/DeferredDemoFrame";
import { DemoLayout } from "./shell/DemoLayout";
import { DemoPanel } from "./shell/DemoPanel";
import ApplicationDetailPage from "./syu-likelion/evaluation/ApplicationDetailPage";
import ApplicantManagementNav from "./syu-likelion/evaluation/ApplicantManagementNav";
import ApplicantPendingPassTable from "./syu-likelion/evaluation/ApplicantPendingPassTable";
import ApplicantTable from "./syu-likelion/evaluation/ApplicantTable";
import { getApplicantManagementViewMeta, type AdminApplicantListView } from "./syu-likelion/evaluation/applicantManagement";
import FinalPendingPassTable from "./syu-likelion/evaluation/FinalPendingPassTable";
import {
  createEvaluationApplicants,
  getEvaluationLists,
  updateEvaluationDocumentScore,
  updateEvaluationInterviewScore,
  updateEvaluationPendingDecision,
} from "./syu-likelion/evaluation/fixture";
import InterviewCandidateDetailPage from "./syu-likelion/evaluation/InterviewCandidateDetailPage";
import InterviewCandidateTable from "./syu-likelion/evaluation/InterviewCandidateTable";
import { canManageApplicantDecisions } from "./syu-likelion/evaluation/permissions";
import service from "./syu-likelion/service.module.css";
import styles from "./ResultStatusDemo.module.css";

/*
 * 원본: features/admin/applications/ApplicationsListPage.tsx,
 * features/admin/interviews/InterviewCandidatesListPage.tsx · feat/#36 · 763061c
 * 공동 작성: 두 목록 페이지는 No4h 약 25% · 저장소 주인 약 75%.
 * 변경: 지원자를 고른 상태의 목록/embedded 상세 배치와 renderTable 대응만 이식.
 * 페이지 h1·필터·페이지네이션·일괄 확정·서버·라우터·URL·인증 조회는 제외한다.
 * 목록 링크와 조회·저장·예비 합격 요청은 가상 응답의 메모리 상태로 대체한다.
 * 화면 밖 패널만 보는 사람·점수 공개·초기화를 조작한다.
 */
export function EvaluationScreenControls() {
  const [applicants, setApplicants] = useState(createEvaluationApplicants);
  const [activeView, setActiveView] = useState<AdminApplicantListView>("DOCUMENT_APPLICANTS");
  const [selectedId, setSelectedId] = useState<number | null>(() => createEvaluationApplicants()[0].document.applicationId);
  const [viewer, setViewer] = useState("MEMBER");
  const [canViewOthersScores, setCanViewOthersScores] = useState(true);
  const [visit, setVisit] = useState(0);
  const viewerId = useId();
  const lists = getEvaluationLists(applicants);
  const results = {
    DOCUMENT_APPLICANTS: lists.documentApplicants,
    DOCUMENT_PENDING: lists.documentPending,
    INTERVIEW_CANDIDATES: lists.interviewCandidates,
    FINAL_PENDING: lists.finalPending,
    FINAL_PASSED: lists.finalPassed,
  };
  const currentResult = results[activeView];
  const selected = applicants.find(({ document }) => document.applicationId === selectedId);
  const documentStage = activeView === "DOCUMENT_APPLICANTS" || activeView === "DOCUMENT_PENDING";
  const canManageDecisions = canManageApplicantDecisions({
    sso: { ssoRole: "USER" },
    roles: [{ level: "STAFF", position: viewer }],
  });
  const viewMeta = getApplicantManagementViewMeta(activeView);
  const tableProps = {
    isLoading: false,
    hasRecruitmentId: true,
    compact: Boolean(selected),
    selectedApplicationId: selectedId,
    onSelectApplication: setSelectedId,
  };

  const changeView = (nextView: AdminApplicantListView) => {
    setActiveView(nextView);
    setSelectedId(results[nextView].items[0]?.applicationId ?? null);
  };
  const reset = () => {
    const initial = createEvaluationApplicants();
    setApplicants(initial);
    setActiveView("DOCUMENT_APPLICANTS");
    setSelectedId(initial[0].document.applicationId);
    setViewer("MEMBER");
    setCanViewOthersScores(true);
    setVisit((value) => value + 1);
  };
  const renderTable = () => {
    if (activeView === "DOCUMENT_PENDING") {
      return <ApplicantPendingPassTable {...tableProps} result={lists.documentPending} />;
    }
    if (activeView === "INTERVIEW_CANDIDATES") {
      return <InterviewCandidateTable {...tableProps} result={lists.interviewCandidates} />;
    }
    if (activeView === "FINAL_PENDING") {
      return <FinalPendingPassTable {...tableProps} result={lists.finalPending} />;
    }
    return <ApplicantTable {...tableProps} result={activeView === "FINAL_PASSED" ? lists.finalPassed : lists.documentApplicants} />;
  };

  return (
    <DemoLayout variant="wide">
      <DeferredDemoFrame
        variant="wide"
        designWidth={1264}
        scaleFrom="xl"
        resetKey={`${visit}:${activeView}:${selectedId}`}
        label="모집 단계별 지원자 목록과 평가 화면"
        className={styles.frame}
        placeholder={<div className="h-[110rem] bg-paper-sunk" aria-hidden="true" />}
      >
        <section className={`${service.screen} px-4 py-10 lg:px-8 lg:py-14`} aria-label="운영진 지원자 평가">
          <div className="mx-auto max-w-[1200px]">
            <div className={`grid items-start gap-4${selected ? " xl:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]" : ""}`}>
              <div className="min-w-0 space-y-4 self-start">
                <ApplicantManagementNav activeView={activeView} onChangeView={changeView} />
                <div className="min-w-0 rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 lg:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[var(--syu-gray-3)]">{viewMeta.label}</p>
                    <p className="text-xs text-[var(--syu-gray-4)]">총 {currentResult.items.length}명</p>
                  </div>
                  {renderTable()}
                </div>
              </div>
              {selected ? (
                <div className="min-w-0 self-start">
                  {documentStage ? (
                    <ApplicationDetailPage
                      key={`${visit}:${activeView}:${selectedId}`}
                      detail={selected.document}
                      myScore={selected.myDocumentScore}
                      documentScoreDetail={{ ...selected.documentScores, canViewOthersScores }}
                      canManageDecisions={canManageDecisions}
                      onSave={(payload) => setApplicants((current) => updateEvaluationDocumentScore(current, selected.document.applicationId, payload))}
                      onPendingDecision={(decision) => setApplicants((current) => updateEvaluationPendingDecision(current, selected.document.applicationId, "document", decision))}
                      onClose={() => setSelectedId(null)}
                    />
                  ) : (
                    <InterviewCandidateDetailPage
                      key={`${visit}:${activeView}:${selectedId}`}
                      detail={selected.interview}
                      myScore={selected.myInterviewScore}
                      interviewScoreDetail={{ ...selected.interviewScores, canViewOthersScores }}
                      documentScoreDetail={{ ...selected.documentScores, canViewOthersScores }}
                      canManageDecisions={canManageDecisions}
                      activeView={activeView}
                      recruitmentId={selected.document.recruitmentId}
                      onSave={(payload) => setApplicants((current) => updateEvaluationInterviewScore(current, selected.document.applicationId, payload))}
                      onPendingDecision={(decision) => setApplicants((current) => updateEvaluationPendingDecision(current, selected.document.applicationId, "interview", decision))}
                      onClose={() => setSelectedId(null)}
                    />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </DeferredDemoFrame>
      <DemoPanel
        label="보는 사람과 공개 범위"
        intro={
          <>
            <p className="font-semibold">보는 사람과 공개 범위</p>
            <p className="text-sm text-ink-2">왼쪽 목록에서 단계를 바꿔 보세요. 서류 단계에는 이름이 없고, 면접 단계부터 이름이 보입니다.</p>
          </>
        }
        controls={
          <>
            <RadioChoices
              name={viewerId}
              legend="보는 사람"
              options={[{ label: "운영진", value: "MEMBER" }, { label: "회장단", value: "PRESIDENT" }]}
              value={viewer}
              onValueChange={setViewer}
              compactDesktop={false}
            />
            <label className={styles.check}>
              <input type="checkbox" checked={canViewOthersScores} onChange={(event) => setCanViewOthersScores(event.target.checked)} />
              다른 운영진 점수 공개
            </label>
            <button type="button" className={styles.clear} onClick={reset}>처음으로</button>
          </>
        }
      />
    </DemoLayout>
  );
}
