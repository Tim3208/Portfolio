/*
 * 원본: features/admin/interviews/InterviewCandidateDetailPage.tsx · feat/#36 · 763061c
 * 공동 작성: 현재 줄 기준 팀원 No4h 174줄 · 저장소 주인 435줄.
 * 변경: API·인증·URL 상태·조회/저장 대기는 props와 메모리 콜백으로 바꾸고 embedded 표면만 이식.
 * 독립 페이지의 목록 내비·목록 이동은 제외. 외부 포트폴리오/파일 링크는 같은 모양의 비활성 글자로 표시.
 * 원본 신원 정보·탭·점수 입력·다른 운영진 점수 공개·최종 합격 목록과 권한에 따른 예비 합격 분기는 유지.
 * 서비스 색 토큰만 --syu-*로 격리하고 제목 계층·입력 접근 이름·탭 선택 상태·저장 안내의 status를 보완.
 * 호출부는 지원자를 바꿀 때 key를 바꾸어 원본의 새 상세 조회처럼 입력과 기본 탭을 초기화한다.
 */
import { useState } from "react";
import type { AdminInterviewsListView } from "./applicantManagement";
import type {
  AdminDocumentScoresDetailResponse,
  AdminInterviewCandidateDetailResponse,
  AdminInterviewScoreDetailResponse,
  AdminMyInterviewScoreResponse,
  UpsertAdminMyInterviewScoreRequest,
} from "./type";

type InterviewCandidateDetailPageProps = {
  detail: AdminInterviewCandidateDetailResponse;
  myScore: AdminMyInterviewScoreResponse;
  interviewScoreDetail: AdminInterviewScoreDetailResponse | null;
  documentScoreDetail: AdminDocumentScoresDetailResponse | null;
  canManageDecisions: boolean;
  activeView: AdminInterviewsListView;
  recruitmentId?: number | null;
  onSave: (payload: UpsertAdminMyInterviewScoreRequest) => void;
  onPendingDecision: (decision: "PASS" | "FAIL") => void;
  onClose?: () => void;
};

type DetailTab = "document" | "score" | "review";

function formatPart(value: string) {
  if (value === "FRONTEND") return "FRONTEND";
  if (value === "BACKEND") return "BACKEND";
  if (value === "AI_ML") return "AI/ML";
  if (value === "PM_DESIGN") return "PM/DESIGN";
  return value;
}

function formatEnrollment(value: string) {
  const upper = value.toUpperCase();
  if (upper === "ENROLLED") return "재학";
  if (upper === "LEAVE") return "휴학";
  if (upper === "GRADUATED") return "졸업";
  return value;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(date);
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getTabLabel(tab: DetailTab) {
  if (tab === "document") return "지원서 보기";
  if (tab === "score") return "점수 매기기";
  return "점수 현황";
}

export default function InterviewCandidateDetailPage({
  detail,
  myScore,
  interviewScoreDetail,
  documentScoreDetail,
  canManageDecisions,
  activeView,
  recruitmentId,
  onSave,
  onPendingDecision,
  onClose,
}: InterviewCandidateDetailPageProps) {
  const effectiveRecruitmentId = recruitmentId ?? null;
  const canManageFinalPendingDecision = effectiveRecruitmentId !== null;
  const [activeTab, setActiveTab] = useState<DetailTab>("document");
  const [saveMessage, setSaveMessage] = useState("");
  const [decisionMessage, setDecisionMessage] = useState("");
  const [score, setScore] = useState(myScore.score ?? 0);
  const [comment, setComment] = useState(myScore.comment ?? "");
  const portfolioLink =
    detail.portfolioUrl?.trim() || detail.portfolioLink?.trim() || "";

  const handleSave = () => {
    setSaveMessage("");
    setDecisionMessage("");
    onSave({ score, comment: comment.trim() });
    setSaveMessage("면접 점수를 저장했습니다.");
  };

  const handlePendingDecision = (decision: "PASS" | "FAIL") => {
    if (!canManageDecisions || !canManageFinalPendingDecision || !effectiveRecruitmentId) return;
    setSaveMessage("");
    setDecisionMessage(
      decision === "PASS"
        ? "최종 예비 합격으로 처리했습니다."
        : "최종 예비 합격을 취소했습니다.",
    );
    onPendingDecision(decision);
  };

  const documentSectionClass =
    activeTab === "document"
      ? "mt-8 space-y-8"
      : "hidden print:block print:mt-8 print:space-y-8";

  const detailBody = (
    <div
      className={`rounded-2xl bg-[#323640] p-6 lg:p-8 print:rounded-none print:bg-transparent print:p-0 print:text-black`}
    >
      {detail && (
        <>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--syu-gray-4)] print:text-gray-600">
            Interview Candidate
          </p>
          <h3 className="mt-2 text-[36px] font-bold lg:text-[44px]">
            {detail.applicant.name}
          </h3>
          <p className="mt-2 text-lg text-[var(--syu-gray-3)] print:text-gray-700">
            {formatPart(detail.applyPart)}
          </p>

          <dl className="mt-6 grid grid-cols-[110px_1fr] gap-y-2 text-sm text-[var(--syu-gray-3)] lg:max-w-[620px]">
            <dt className="font-semibold text-[var(--syu-gray-2)]">이름</dt>
            <dd>{detail.applicant.name}</dd>
            <dt className="font-semibold text-[var(--syu-gray-2)]">학과</dt>
            <dd>{detail.applicant.department}</dd>
            <dt className="font-semibold text-[var(--syu-gray-2)]">학번</dt>
            <dd>{detail.applicant.studentNo}</dd>
            <dt className="font-semibold text-[var(--syu-gray-2)]">학적상태</dt>
            <dd>
              {detail.applicant.grade}학년 {formatEnrollment(detail.applicant.enrollment)}
            </dd>
            <dt className="font-semibold text-[var(--syu-gray-2)]">전화번호</dt>
            <dd>{detail.applicant.phone}</dd>
            <dt className="font-semibold text-[var(--syu-gray-2)]">이메일</dt>
            <dd>{detail.applicant.email}</dd>
            <dt className="font-semibold text-[var(--syu-gray-2)]">지원일시</dt>
            <dd>{formatDateTime(detail.submittedAt)}</dd>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-[#606673] pb-4 print:hidden">
            {(["document", "score", "review"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-pressed={activeTab === tab}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-[var(--syu-main-1)] text-[var(--syu-white)]"
                    : "bg-[#454c5a] text-[var(--syu-gray-2)] hover:bg-[#565f70]"
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>

          <div className={documentSectionClass}>
            {detail.reservation && (
              <div className="rounded-lg bg-[#404654] px-4 py-3 text-sm text-[var(--syu-gray-2)] print:border print:border-black/20 print:bg-transparent print:text-black">
                면접 예약: {formatDateTime(detail.reservation.startAt)} -{" "}
                {formatDateTime(detail.reservation.endAt).slice(-5)}
              </div>
            )}

            <article className="space-y-3">
              <h4 className="text-lg font-semibold">포트폴리오</h4>
              <div className="rounded-lg bg-[#404654] p-4 text-sm text-[var(--syu-gray-2)] print:border print:border-black/20 print:bg-transparent print:text-black">
                <dl className="space-y-3">
                  <div className="grid grid-cols-[90px_1fr] items-start gap-2">
                    <dt className="text-[var(--syu-gray-4)] print:text-gray-700">링크</dt>
                    <dd className="min-w-0">
                      {portfolioLink ? (
                        <span
                        title="데모에서는 외부 링크를 열지 않습니다."
                          className="break-all text-[#8fd3ff] underline underline-offset-2 print:text-black"
                        >
                          {portfolioLink}
                        </span>
                      ) : (
                        <span className="text-[var(--syu-gray-4)] print:text-gray-700">-</span>
                      )}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[90px_1fr] items-start gap-2">
                    <dt className="text-[var(--syu-gray-4)] print:text-gray-700">첨부 파일</dt>
                    <dd className="min-w-0">
                      {detail.files.length > 0 ? (
                        <ul className="space-y-2">
                          {detail.files.map((file) => (
                            <li key={file.fileId}>
                              {file.url && file.url.trim().length > 0 ? (
                                <span
                        title="데모에서는 외부 링크를 열지 않습니다."
                                  className="inline-flex max-w-full items-center gap-2 text-[#8fd3ff] underline underline-offset-2 print:text-black"
                                >
                                  <span className="truncate">{file.originalName}</span>
                                  <span className="shrink-0 text-xs text-[var(--syu-gray-4)] print:text-gray-700">
                                    ({formatFileSize(file.size)})
                                  </span>
                                </span>
                              ) : (
                                <span className="inline-flex max-w-full items-center gap-2 text-[var(--syu-gray-2)] print:text-black">
                                  <span className="truncate">{file.originalName}</span>
                                  <span className="shrink-0 text-xs text-[var(--syu-gray-4)] print:text-gray-700">
                                    ({formatFileSize(file.size)})
                                  </span>
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-[var(--syu-gray-4)] print:text-gray-700">-</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </article>

            <div className="space-y-8">
              {detail.answers.map((item, index) => (
                <article key={item.questionId} className="space-y-3">
                  <h4 className="text-lg font-semibold">
                    문항 {index + 1}. {item.content}
                  </h4>
                  <p className="whitespace-pre-wrap rounded-lg bg-[#404654] p-4 text-sm text-[var(--syu-gray-2)] print:border print:border-black/20 print:bg-transparent print:text-black">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>

            {documentScoreDetail && (
              <>
                <div className="h-px bg-[#606673] print:bg-black/20" />

                <section className="space-y-5">
                  <div>
                    <h4 className="text-[22px] font-semibold">서류 평가 요약</h4>
                    <p className="mt-2 text-sm text-[var(--syu-gray-4)] print:text-gray-700">
                      리뷰어 {documentScoreDetail.reviewCount}명, 평균 점수{" "}
                      {documentScoreDetail.average.toFixed(2)}
                    </p>
                  </div>

                  {documentScoreDetail.canViewOthersScores &&
                    documentScoreDetail.reviews.map((review, idx) => (
                      <article
                        key={`${review.reviewer.name}-${idx}`}
                        className="rounded-xl border border-[#4a5162] bg-[#3a404d] p-4 print:border-black/20 print:bg-transparent"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold">
                            {review.reviewer.name} ({review.reviewer.part})
                          </p>
                          <p className="text-xs text-[var(--syu-gray-4)] print:text-gray-700">
                            총점 {review.total}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.scores.map((scoreItem) => (
                            <span
                              key={scoreItem.questionId}
                              className="rounded-md bg-[#4f5668] px-2 py-1 text-xs print:border print:border-black/20 print:bg-transparent"
                            >
                              Q{scoreItem.questionId}: {scoreItem.score}
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 whitespace-pre-wrap rounded-md bg-[#454c5a] p-3 text-sm text-[var(--syu-gray-2)] print:border print:border-black/20 print:bg-transparent print:text-black">
                          {review.comment || "-"}
                        </p>
                      </article>
                    ))}
                </section>
              </>
            )}
          </div>

          {activeTab === "score" && (
            <div className="mt-8 print:hidden">
              <div className="space-y-3">
                <h4 className="text-[22px] font-semibold">면접 점수 입력</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <label htmlFor={`interview-score-${detail.applicationId}`} className="text-sm text-[var(--syu-gray-3)]">면접 점수</label>
                  <input
                    id={`interview-score-${detail.applicationId}`}
                    type="number"
                    min={0}
                    step={1}
                    value={score}
                    onChange={(event) => {
                      const numeric = Number(event.target.value);
                      setScore(Number.isFinite(numeric) ? Math.max(0, numeric) : 0);
                    }}
                    className="h-9 w-28 rounded-md border border-[#666d7d] bg-[#505767] px-3 text-sm outline-none focus:border-[var(--syu-main-1)]"
                  />
                </div>
              </div>

              <div className="my-8 h-px bg-[#606673]" />

              <div className="space-y-3">
                <h4 className="text-[22px] font-semibold">총평 코멘트</h4>
                <textarea
                  aria-label="총평 코멘트"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={5}
                  placeholder="코멘트를 입력해 주세요."
                  className="w-full resize-none rounded-xl border border-[#62697A] bg-[#4C5262] p-4 text-sm text-[var(--syu-white)] placeholder:text-[var(--syu-gray-4)] outline-none focus:border-[var(--syu-main-1)]"
                />
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-[var(--syu-main-1)] px-10 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  평가 저장
                </button>
              </div>
            </div>
          )}

          {activeTab === "review" && (
            <div className="mt-8 space-y-5 print:hidden">
              {interviewScoreDetail ? (
                <>
                  <div className="rounded-lg bg-[#404654] px-4 py-3 text-sm text-[var(--syu-gray-2)]">
                    리뷰어 {interviewScoreDetail.reviewCount}명 평균:{" "}
                    {interviewScoreDetail.average.toFixed(2)}
                  </div>

                  {interviewScoreDetail.canViewOthersScores &&
                  interviewScoreDetail.reviews.length > 0 ? (
                    interviewScoreDetail.reviews.map((review, idx) => (
                      <article
                        key={`${review.reviewerUserUuid}-${idx}`}
                        className="rounded-xl border border-[#4a5162] bg-[#3a404d] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold">
                            리뷰어 {idx + 1}
                          </p>
                          <p className="text-xs text-[var(--syu-gray-4)]">총점: {review.score}</p>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap rounded-md bg-[#454c5a] p-3 text-sm text-[var(--syu-gray-2)]">
                          {review.comment || "-"}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--syu-gray-3)]">
                      다른 평가자의 상세 점수 현황은 API 연동 시 이 영역에 표시됩니다.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-[var(--syu-gray-3)]">
                  면접 점수 현황 데이터가 준비되면 이 영역에 표시됩니다.
                </p>
              )}

              {canManageDecisions &&
                activeView !== "FINAL_PASSED" &&
                canManageFinalPendingDecision && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handlePendingDecision("PASS")}
                      className="rounded-lg bg-[#1f9d55] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                      최종 예비 합격
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePendingDecision("FAIL")}
                      className="rounded-lg bg-[#cc3a3a] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                      최종 예비 합격 취소
                    </button>
                  </div>
                )}

              {canManageDecisions && !effectiveRecruitmentId && (
                <p className="mt-4 text-sm text-[var(--syu-gray-4)]">
                  recruitmentId가 없어 최종 예비 합격 처리를 실행할 수 없습니다.
                </p>
              )}
            </div>
          )}

          {saveMessage && (
            <p role="status" className="mt-3 text-center text-sm text-[#8fd3ff] print:hidden">
              {saveMessage}
            </p>
          )}
          {decisionMessage && (
            <p role="status" className="mt-3 text-center text-sm text-[#8fd3ff] print:hidden">
              {decisionMessage}
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 print:rounded-none print:border-0 print:bg-transparent print:p-0">
      <div className="mb-3 flex items-center justify-between print:hidden">
        <h3 className="text-sm font-semibold text-[var(--syu-gray-2)]">지원자 상세</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#454c5a] px-3 py-1.5 text-xs"
          >
            닫기
          </button>
        )}
      </div>
      {detailBody}
    </div>
  );
}
