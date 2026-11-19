/**
 * 응답 구조 원본: features/admin/type.ts, 목록 선택 분기:
 * features/admin/applications/ApplicationsListPage.tsx · interviews/InterviewCandidatesListPage.tsx
 * 기준: feat/#36 · 763061c. 원본 type.ts는 No4h 312줄 · 저장소 주인 148줄,
 * 두 목록 페이지는 팀원 약 25% · 저장소 주인 약 75%의 공동 작성 코드다.
 * 변경: 원본 데이터와 스크린샷을 사용하지 않고, 데모를 위해 새로 만든 가상 응답만 제공.
 * 서버 요청 대신 메모리에서 점수 저장·예비 합격 이동을 반영한다. URL·통신·현재 시각은 사용하지 않음.
 */
import type { AdminApplicantListView } from "./applicantManagement";
import type {
  AdminApplicationDetailResponse,
  AdminApplicationListItem,
  AdminApplicationListResponse,
  AdminApplyPart,
  AdminDocumentPendingPassListResponse,
  AdminDocumentScoreReview,
  AdminDocumentScoresDetailResponse,
  AdminFinalPendingPassListResponse,
  AdminInterviewCandidateDetailResponse,
  AdminInterviewCandidateListResponse,
  AdminInterviewScoreDetailResponse,
  AdminMyDocumentScoreResponse,
  AdminMyInterviewScoreResponse,
  UpsertAdminMyDocumentScoreRequest,
  UpsertAdminMyInterviewScoreRequest,
} from "./type";

export type EvaluationApplicant = {
  view: AdminApplicantListView;
  document: AdminApplicationDetailResponse;
  interview: AdminInterviewCandidateDetailResponse;
  myDocumentScore: AdminMyDocumentScoreResponse;
  documentScores: AdminDocumentScoresDetailResponse;
  myInterviewScore: AdminMyInterviewScoreResponse;
  interviewScores: AdminInterviewScoreDetailResponse;
};

const FIXED_SUBMITTED_AT = "2026-03-01T10:00:00+09:00";
const FIXED_SLOT_START = "2026-03-15T10:00:00+09:00";
const FIXED_SLOT_END = "2026-03-15T10:20:00+09:00";
const MY_REVIEWER = "운영진 A";
const QUESTION_LABELS = [
  "샘플 질문 1 · 지원 동기",
  "샘플 질문 2 · 관심 있는 분야",
  "샘플 질문 3 · 함께한 경험",
  "샘플 질문 4 · 문제를 풀었던 과정",
  "샘플 질문 5 · 만들고 싶은 것",
  "샘플 질문 6 · 활동 계획",
] as const;

function makeDocumentReview(
  name: string,
  values: number[],
): AdminDocumentScoreReview {
  const scores = values.map((score, index) => ({ questionId: index + 1, score }));
  return {
    reviewer: { profileImageUrl: "", name, part: "FRONTEND" },
    scores,
    total: scores.reduce((sum, item) => sum + item.score, 0),
    comment: "샘플 코멘트입니다. 가상 답변의 설명 과정을 확인했습니다.",
  };
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

/** 서류 응답 객체는 원본 타입대로 이름·전화번호·메일 필드를 만들지 않는다. */
export function createEvaluationApplicants(): EvaluationApplicant[] {
  const views: AdminApplicantListView[] = [
    "DOCUMENT_APPLICANTS",
    "DOCUMENT_APPLICANTS",
    "DOCUMENT_APPLICANTS",
    "DOCUMENT_PENDING",
    "INTERVIEW_CANDIDATES",
    "INTERVIEW_CANDIDATES",
    "FINAL_PENDING",
    "FINAL_PASSED",
  ];
  const parts: AdminApplyPart[] = ["FRONTEND", "BACKEND", "AI_ML", "PM_DESIGN"];

  return views.map((view, index) => {
    const letter = String.fromCharCode(65 + index);
    const applicationId = 9001 + index;
    const isDraft = index === 2;
    const isInterview = index >= 4;
    const applyPart = parts[index % parts.length];
    const reviews = isDraft ? [] : [
      makeDocumentReview(MY_REVIEWER, [6, 7, 6, 14, 12, 20]),
      makeDocumentReview("운영진 B", [7, 8, 6, 15, 14, 22]),
    ];
    const documentScores: AdminDocumentScoresDetailResponse = {
      applicationId,
      average: average(reviews.map((review) => review.total)),
      reviewCount: reviews.length,
      canViewOthersScores: true,
      reviews,
    };
    const document: AdminApplicationDetailResponse = {
      applicationId,
      recruitmentId: 9000,
      applyPart,
      status: isDraft ? "DRAFT" : view === "FINAL_PASSED" ? "FINAL_PASSED" : isInterview ? "DOC_PASSED" : "SUBMITTED",
      submittedAt: FIXED_SUBMITTED_AT,
      portfolioUrl: null,
      applicant: {
        department: "샘플 학과",
        studentNoPrefix: `샘플${letter}`,
        grade: 1 + index % 3,
        enrollment: "ENROLLED",
      },
      answers: QUESTION_LABELS.map((content, questionIndex) => ({
        questionId: questionIndex + 1,
        content,
        answer: `샘플 답변입니다. 질문 ${questionIndex + 1}에 대한 가상 지원서의 짧은 설명입니다.`,
      })),
      files: [],
      docAvgScore: isDraft ? null : documentScores.average,
    };
    const interview: AdminInterviewCandidateDetailResponse = {
      applicationId,
      portfolioUrl: null,
      applicant: {
        name: `지원자 ${letter}`,
        department: "샘플 학과",
        studentNo: `샘플 학번 ${letter}`,
        grade: document.applicant.grade,
        enrollment: "ENROLLED",
        birthDate: "2000-01-01",
        phone: "010-0000-0000",
        email: "sample@example.com",
      },
      applyPart,
      submittedAt: FIXED_SUBMITTED_AT,
      answers: document.answers.map((answer) => ({ ...answer })),
      files: [],
      docAvgScore: document.docAvgScore,
      reservation: isInterview ? {
        slotId: 9900 + index,
        startAt: FIXED_SLOT_START,
        endAt: FIXED_SLOT_END,
      } : null,
    };
    const interviewReviews = isInterview ? [
      { reviewerUserUuid: MY_REVIEWER, score: 70, comment: "샘플 코멘트입니다. 가상 면접 답변을 확인했습니다." },
      { reviewerUserUuid: "운영진 B", score: 80, comment: "샘플 코멘트입니다. 설명 순서를 살펴봤습니다." },
    ] : [];

    return {
      view,
      document,
      interview,
      myDocumentScore: {
        exists: !isDraft,
        scores: reviews[0]?.scores.map((score) => ({ ...score })) ?? [],
        comment: reviews[0]?.comment ?? "",
      },
      documentScores,
      myInterviewScore: {
        exists: isInterview,
        score: interviewReviews[0]?.score ?? 0,
        comment: interviewReviews[0]?.comment ?? "",
      },
      interviewScores: {
        applicationId,
        average: average(interviewReviews.map((review) => review.score)),
        reviewCount: interviewReviews.length,
        canViewOthersScores: true,
        reviews: interviewReviews,
      },
    };
  });
}

function pageFor(totalElements: number) {
  return { page: 0, size: 20, totalElements, totalPages: totalElements ? 1 : 0 };
}

function toApplicationListItem(applicant: EvaluationApplicant): AdminApplicationListItem {
  const detail = applicant.document;
  return {
    applicationId: detail.applicationId,
    applyPart: detail.applyPart,
    status: detail.status,
    submittedAt: detail.submittedAt,
    docAvgScore: detail.docAvgScore,
    ...detail.applicant,
  };
}

export function getEvaluationLists(applicants: EvaluationApplicant[]) {
  const forView = (view: AdminApplicantListView) => applicants.filter((applicant) => applicant.view === view);
  const documentApplicantsItems = forView("DOCUMENT_APPLICANTS").map(toApplicationListItem);
  const documentPendingItems = forView("DOCUMENT_PENDING").map(({ document }) => ({
    applicationId: document.applicationId,
    docAvgScore: document.docAvgScore,
    applyPart: document.applyPart,
  }));
  const interviewCandidateItems = forView("INTERVIEW_CANDIDATES").map(({ document, interview }) => ({
    applicationId: interview.applicationId,
    name: interview.applicant.name,
    department: interview.applicant.department,
    studentNoPrefix: document.applicant.studentNoPrefix,
    grade: interview.applicant.grade,
    enrollment: interview.applicant.enrollment,
    applyPart: interview.applyPart,
    phone: interview.applicant.phone,
    slotStartAt: interview.reservation?.startAt ?? null,
    slotEndAt: interview.reservation?.endAt ?? null,
    docAvgScore: interview.docAvgScore,
  }));
  const finalPendingItems = forView("FINAL_PENDING").map(({ document, interviewScores }) => ({
    applicationId: document.applicationId,
    interviewAvgScore: interviewScores.reviewCount ? interviewScores.average : null,
    applyPart: document.applyPart,
  }));
  const finalPassedItems = forView("FINAL_PASSED").map(toApplicationListItem);

  return {
    documentApplicants: { items: documentApplicantsItems, page: pageFor(documentApplicantsItems.length) } satisfies AdminApplicationListResponse,
    documentPending: { items: documentPendingItems, page: pageFor(documentPendingItems.length) } satisfies AdminDocumentPendingPassListResponse,
    interviewCandidates: { items: interviewCandidateItems, page: pageFor(interviewCandidateItems.length) } satisfies AdminInterviewCandidateListResponse,
    finalPending: { items: finalPendingItems, page: pageFor(finalPendingItems.length) } satisfies AdminFinalPendingPassListResponse,
    finalPassed: { items: finalPassedItems, page: pageFor(finalPassedItems.length) } satisfies AdminApplicationListResponse,
  };
}

export function updateEvaluationDocumentScore(
  applicants: EvaluationApplicant[],
  applicationId: number,
  payload: UpsertAdminMyDocumentScoreRequest,
): EvaluationApplicant[] {
  return applicants.map((applicant) => {
    if (applicant.document.applicationId !== applicationId || applicant.document.status === "DRAFT") return applicant;
    const scores = payload.scores.map((score) => ({ ...score }));
    const comment = payload.comment ?? "";
    const review: AdminDocumentScoreReview = {
      reviewer: { profileImageUrl: "", name: MY_REVIEWER, part: "FRONTEND" },
      scores,
      total: scores.reduce((sum, item) => sum + item.score, 0),
      comment,
    };
    const reviews = [review, ...applicant.documentScores.reviews.filter((item) => item.reviewer.name !== MY_REVIEWER)];
    const nextAverage = average(reviews.map((item) => item.total));
    return {
      ...applicant,
      document: { ...applicant.document, docAvgScore: nextAverage },
      interview: { ...applicant.interview, docAvgScore: nextAverage },
      myDocumentScore: { exists: true, scores, comment },
      documentScores: { ...applicant.documentScores, average: nextAverage, reviewCount: reviews.length, reviews },
    };
  });
}

export function updateEvaluationInterviewScore(
  applicants: EvaluationApplicant[],
  applicationId: number,
  payload: UpsertAdminMyInterviewScoreRequest,
): EvaluationApplicant[] {
  return applicants.map((applicant) => {
    if (applicant.document.applicationId !== applicationId) return applicant;
    const review = { reviewerUserUuid: MY_REVIEWER, score: payload.score, comment: payload.comment };
    const reviews = [review, ...applicant.interviewScores.reviews.filter((item) => item.reviewerUserUuid !== MY_REVIEWER)];
    return {
      ...applicant,
      myInterviewScore: { exists: true, score: payload.score, comment: payload.comment },
      interviewScores: { ...applicant.interviewScores, average: average(reviews.map((item) => item.score)), reviewCount: reviews.length, reviews },
    };
  });
}

export function updateEvaluationPendingDecision(
  applicants: EvaluationApplicant[],
  applicationId: number,
  stage: "document" | "interview",
  decision: "PASS" | "FAIL",
): EvaluationApplicant[] {
  return applicants.map((applicant) => {
    if (applicant.document.applicationId !== applicationId || applicant.document.status === "DRAFT") return applicant;
    const view = stage === "document"
      ? decision === "PASS" ? "DOCUMENT_PENDING" : "DOCUMENT_APPLICANTS"
      : decision === "PASS" ? "FINAL_PENDING" : "INTERVIEW_CANDIDATES";
    return { ...applicant, view };
  });
}
