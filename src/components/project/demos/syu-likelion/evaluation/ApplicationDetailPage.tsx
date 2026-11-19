/*
 * 원본: features/admin/applications/ApplicationDetailPage.tsx · feat/#36 · 763061c
 * 공동 작성: 현재 줄 기준 팀원 No4h 381줄 · 저장소 주인 208줄.
 * 변경: API·인증·URL 상태·조회/저장 대기는 props와 메모리 콜백으로 바꾸고 embedded 표면만 이식.
 * 독립 페이지의 목록 내비·목록 이동은 제외. 외부 포트폴리오/파일 링크는 같은 모양의 비활성 글자로 표시.
 * 원본 탭·임시저장 제한·문항별 점수 범위·다른 운영진 점수 공개·예비 합격 권한 분기는 유지.
 * 서비스 색 토큰만 --syu-*로 격리하고 제목 계층·입력 접근 이름·탭 선택 상태·저장 안내의 status를 보완.
 * 호출부는 지원자를 바꿀 때 key를 바꾸어 원본의 새 상세 조회처럼 입력과 기본 탭을 초기화한다.
 */
import { useMemo, useState } from "react";
import type {
  AdminApplicationDetailResponse,
  AdminDocumentScoresDetailResponse,
  AdminMyDocumentScoreResponse,
  UpsertAdminMyDocumentScoreRequest,
} from "./type";

type ApplicationDetailPageProps = {
  detail: AdminApplicationDetailResponse;
  myScore: AdminMyDocumentScoreResponse;
  documentScoreDetail: AdminDocumentScoresDetailResponse | null;
  canManageDecisions: boolean;
  onSave: (payload: UpsertAdminMyDocumentScoreRequest) => void;
  onPendingDecision: (decision: "PASS" | "FAIL") => void;
  onClose?: () => void;
};

type DetailTab = "document" | "score" | "review";

const DOCUMENT_QUESTION_MAX_SCORES = [10, 10, 10, 20, 20, 30] as const;
const DEFAULT_DOCUMENT_QUESTION_MAX_SCORE = 30;

const getDocumentQuestionMaxScore = (index: number) =>
  DOCUMENT_QUESTION_MAX_SCORES[index] ?? DEFAULT_DOCUMENT_QUESTION_MAX_SCORE;

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
  if (tab === "document") return "서류 보기";
  if (tab === "score") return "점수 매기기";
  return "점수 현황";
}

function isDraftApplicationStatus(value?: string | null) {
  return (value?.toUpperCase?.() ?? "") === "DRAFT";
}

export default function ApplicationDetailPage({
  detail,
  myScore,
  documentScoreDetail,
  canManageDecisions,
  onSave,
  onPendingDecision,
  onClose,
}: ApplicationDetailPageProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("document");
  const [saveMessage, setSaveMessage] = useState("");
  const [pendingDecisionMessage, setPendingDecisionMessage] = useState("");
  const [scores, setScores] = useState<Record<number, number>>(() =>
    Object.fromEntries(myScore.scores.map((item) => [item.questionId, item.score])),
  );
  const [comment, setComment] = useState(myScore.comment ?? "");
  const canManageDocumentPendingDecision = canManageDecisions;

  const scoredQuestions = useMemo(() =>
    detail.answers.map((answer) => ({
      questionId: answer.questionId,
      content: answer.content,
      answer: answer.answer,
      score: scores[answer.questionId] ?? 0,
    })), [detail, scores]);
  const isDraftApplication = isDraftApplicationStatus(detail.status);

  const handleSave = () => {
    if (isDraftApplication) return;
    setSaveMessage("");
    onSave({
      scores: scoredQuestions.map((item) => ({
        questionId: item.questionId,
        score: item.score,
      })),
      comment,
    });
    setSaveMessage("점수를 저장했습니다.");
  };

  const handlePendingDecision = (decision: "PASS" | "FAIL") => {
    if (!canManageDecisions || isDraftApplication) return;
    setPendingDecisionMessage(
      decision === "PASS"
        ? "서류 예비 합격으로 처리했습니다."
        : "서류 예비 합격을 취소했습니다.",
    );
    onPendingDecision(decision);
  };

  const detailBody = (
    <div
      className={`rounded-2xl bg-[#323640] p-6 lg:p-8 print:rounded-none print:bg-transparent print:p-0 print:text-black`}
    >
      <h3 className="text-[36px] font-bold lg:text-[44px]">
        {formatPart(detail?.applyPart ?? "-")}
      </h3>

      {detail && (
        <>
          <dl className="mt-6 grid grid-cols-[110px_1fr] gap-y-2 text-sm text-[var(--syu-gray-3)] lg:max-w-[520px]">
            <dt className="font-semibold text-[var(--syu-gray-2)]">학과</dt>
            <dd>{detail.applicant.department}</dd>
            <dt className="font-semibold text-[var(--syu-gray-2)]">학번</dt>
            <dd>{detail.applicant.studentNoPrefix}학번</dd>
            <dt className="font-semibold text-[var(--syu-gray-2)]">학적상태</dt>
            <dd>
              {detail.applicant.grade}학년 {formatEnrollment(detail.applicant.enrollment)}
            </dd>
            <dt className="font-semibold text-[var(--syu-gray-2)]">지원일시</dt>
            <dd>{formatDateTime(detail.submittedAt)}</dd>
          </dl>

          {documentScoreDetail && (
            <p className="mt-4 text-sm text-[var(--syu-gray-4)]">
              평균 {documentScoreDetail.reviewCount}명 평균 점수{" "}
              {documentScoreDetail.average.toFixed(2)}
            </p>
          )}
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-[#606673] pb-4 print:hidden">
        {(["document", "score", "review"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            disabled={isDraftApplication && tab !== "document"}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "bg-[var(--syu-main-1)] text-[var(--syu-white)]"
                : "bg-[#454c5a] text-[var(--syu-gray-2)] hover:bg-[#565f70]"
            } ${isDraftApplication && tab !== "document" ? "cursor-not-allowed opacity-50 hover:bg-[#454c5a]" : ""}`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>


      {detail && activeTab === "document" && (
        <div className="mt-8 space-y-8">
          <article className="space-y-3">
            <h4 className="text-lg font-semibold">포트폴리오</h4>
            <div className="rounded-lg bg-[#404654] p-4 text-sm text-[var(--syu-gray-2)]">
              <dl className="space-y-3">
                <div className="grid grid-cols-[90px_1fr] items-start gap-2">
                  <dt className="text-[var(--syu-gray-4)]">링크</dt>
                  <dd className="min-w-0">
                    {detail.portfolioUrl && detail.portfolioUrl.trim().length > 0 ? (
                      <span
                        title="데모에서는 외부 링크를 열지 않습니다."
                        className="break-all text-[#8fd3ff] underline underline-offset-2"
                      >
                        {detail.portfolioUrl}
                      </span>
                    ) : (
                      <span className="text-[var(--syu-gray-4)]">-</span>
                    )}
                  </dd>
                </div>
                <div className="grid grid-cols-[90px_1fr] items-start gap-2">
                  <dt className="text-[var(--syu-gray-4)]">첨부 파일</dt>
                  <dd className="min-w-0">
                    {detail.files.length > 0 ? (
                      <ul className="space-y-2">
                        {detail.files.map((file) => (
                          <li key={file.fileId}>
                            {file.url && file.url.trim().length > 0 ? (
                              <span
                        title="데모에서는 외부 링크를 열지 않습니다."
                                className="inline-flex max-w-full items-center gap-2 text-[#8fd3ff] underline underline-offset-2"
                              >
                                <span className="truncate">{file.originalName}</span>
                                <span className="shrink-0 text-xs text-[var(--syu-gray-4)]">
                                  ({formatFileSize(file.size)})
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex max-w-full items-center gap-2 text-[var(--syu-gray-2)]">
                                <span className="truncate">{file.originalName}</span>
                                <span className="shrink-0 text-xs text-[var(--syu-gray-4)]">
                                  ({formatFileSize(file.size)})
                                </span>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[var(--syu-gray-4)]">-</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </article>

          {detail.answers.map((answer, index) => (
            <article key={answer.questionId} className="space-y-3">
              <h4 className="text-lg font-semibold">
                문항 {index + 1}. {answer.content}
              </h4>
              <p className="whitespace-pre-wrap rounded-lg bg-[#404654] p-4 text-sm text-[var(--syu-gray-2)]">
                {answer.answer}
              </p>
            </article>
          ))}
        </div>
      )}

      {detail && activeTab === "score" && (
        <div className="mt-8">
          {isDraftApplication && (
            <p className="mb-6 rounded-lg border border-[#5d6473] bg-[#404654] px-4 py-3 text-sm text-[var(--syu-gray-2)]">
              임시저장 지원서는 점수를 매길 수 없습니다. 제출 완료 후 평가를 진행해
              주세요.
            </p>
          )}
          <div className="space-y-8">
            {scoredQuestions.map((item, index) => {
              const maxScore = getDocumentQuestionMaxScore(index);

              return (
                <article key={item.questionId} className="space-y-3">
                  <h4 className="text-lg font-semibold">
                    문항 {index + 1}. {item.content}
                  </h4>
                  <p className="whitespace-pre-wrap rounded-lg bg-[#404654] p-4 text-sm text-[var(--syu-gray-2)]">
                    {item.answer}
                  </p>
                  <div className="flex items-center gap-3">
                    <label htmlFor={`document-score-${detail.applicationId}-${item.questionId}`} className="text-sm text-[var(--syu-gray-3)]">
                      문항 점수 (최대 {maxScore}점)
                    </label>
                    <input
                      id={`document-score-${detail.applicationId}-${item.questionId}`}
                      type="number"
                      min={0}
                      max={maxScore}
                      step={1}
                      value={item.score}
                      disabled={isDraftApplication}
                      onChange={(event) => {
                        const numeric = Number(event.target.value);
                        const next = Number.isFinite(numeric)
                          ? Math.max(0, Math.min(maxScore, numeric))
                          : 0;
                        setScores((prev) => ({
                          ...prev,
                          [item.questionId]: next,
                        }));
                      }}
                      className="h-9 w-24 rounded-md border border-[#666d7d] bg-[#505767] px-3 text-sm outline-none focus:border-[var(--syu-main-1)]"
                    />
                  </div>
                </article>
              );
            })}
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
              disabled={isDraftApplication}
              className="w-full resize-none rounded-xl border border-[#62697A] bg-[#4C5262] p-4 text-sm text-[var(--syu-white)] placeholder:text-[var(--syu-gray-4)] outline-none focus:border-[var(--syu-main-1)]"
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={isDraftApplication}
              className="rounded-lg bg-[var(--syu-main-1)] px-10 py-3 text-sm font-semibold disabled:opacity-60"
            >
              점수 저장
            </button>
          </div>
        </div>
      )}

      {detail && activeTab === "review" && (
        <div className="mt-8 space-y-5">
          {isDraftApplication && (
            <p className="rounded-lg border border-[#5d6473] bg-[#404654] px-4 py-3 text-sm text-[var(--syu-gray-2)]">
              임시저장 지원서는 평가 내역을 조회할 수 없습니다.
            </p>
          )}
          {!isDraftApplication && documentScoreDetail ? (
            <>
              <div className="rounded-lg bg-[#404654] px-4 py-3 text-sm text-[var(--syu-gray-2)]">
                리뷰어 {documentScoreDetail.reviewCount}명 평균:{" "}
                {documentScoreDetail.average.toFixed(2)}
              </div>

              {documentScoreDetail.canViewOthersScores &&
                documentScoreDetail.reviews.map((review, idx) => (
                  <article
                    key={`${review.reviewer.name}-${idx}`}
                    className="rounded-xl border border-[#4a5162] bg-[#3a404d] p-4"
                  >
                    <p className="text-sm font-semibold">
                      {review.reviewer.name} ({review.reviewer.part})
                    </p>
                    <p className="mt-1 text-xs text-[var(--syu-gray-4)]">총점: {review.total}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.scores.map((score) => (
                        <span
                          key={score.questionId}
                          className="rounded-md bg-[#4f5668] px-2 py-1 text-xs"
                        >
                          Q{score.questionId}: {score.score}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap rounded-md bg-[#454c5a] p-3 text-sm text-[var(--syu-gray-2)]">
                      {review.comment || "-"}
                    </p>
                  </article>
                ))}

              {canManageDocumentPendingDecision && !isDraftApplication && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePendingDecision("PASS")}
                    className="rounded-lg bg-[#1f9d55] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    서류 예비 합격
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePendingDecision("FAIL")}
                    className="rounded-lg bg-[#cc3a3a] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    서류 예비 합격 취소
                  </button>
                </div>
              )}
            </>
          ) : !isDraftApplication ? (
            <p className="text-sm text-[var(--syu-gray-3)]">점수 상세 정보를 불러오지 못했습니다.</p>
          ) : null}
        </div>
      )}

      {saveMessage && <p role="status" className="mt-2 text-sm text-[#8fd3ff] print:hidden">{saveMessage}</p>}
      {pendingDecisionMessage && (
        <p role="status" className="mt-2 text-sm text-[#8fd3ff] print:hidden">{pendingDecisionMessage}</p>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 print:rounded-none print:border-0 print:bg-transparent print:p-0">
      <div className="mb-3 flex items-center justify-between print:hidden">
        <h3 className="text-sm font-semibold text-[var(--syu-gray-2)]">지원서 상세</h3>
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
