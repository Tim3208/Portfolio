/**
 * 원본: features/admin/type.ts · feat/#36 · 763061c
 * 공동 작성: 원본 전체 현재 줄 기준 팀원 No4h 312줄 · 저장소 주인 148줄.
 * 변경: 지원자 목록·상세·평가에 필요한 타입만 추려 그대로 이식. 사용자·공지·일정 타입은 옮기지 않음.
 * 서류 목록·상세 응답에는 원본처럼 이름 필드가 없다.
 */
export type AdminApplyPart = "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN";

export type AdminApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOC_PASSED"
  | "DOC_FAILED"
  | "FINAL_PASSED"
  | "FINAL_FAILED";

export type AdminApplicationListItem = {
  applicationId: number;
  applyPart: AdminApplyPart | string;
  status: AdminApplicationStatus | string;
  submittedAt: string;
  docAvgScore: number | null;
  department: string;
  studentNoPrefix: string;
  grade: number;
  enrollment: string;
};

export type AdminApplicationListResponse = {
  items: AdminApplicationListItem[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type AdminApplicationAnswer = {
  questionId: number;
  content: string;
  answer: string;
};

export type AdminApplicationFile = {
  fileId: number;
  originalName: string;
  size: number;
  url: string;
};

export type AdminApplicationDetailResponse = {
  applicationId: number;
  recruitmentId: number;
  applyPart: AdminApplyPart | string;
  status: AdminApplicationStatus | string;
  submittedAt: string;
  portfolioUrl: string | null;
  applicant: {
    department: string;
    studentNoPrefix: string;
    grade: number;
    enrollment: string;
  };
  answers: AdminApplicationAnswer[];
  files: AdminApplicationFile[];
  docAvgScore: number | null;
};

export type AdminInterviewCandidateListItem = {
  applicationId: number;
  name: string;
  department: string;
  studentNoPrefix: string;
  grade: number;
  enrollment: string;
  applyPart: AdminApplyPart | string;
  phone: string;
  slotStartAt: string | null;
  slotEndAt: string | null;
  docAvgScore: number | null;
};

export type AdminInterviewCandidateListResponse = {
  items: AdminInterviewCandidateListItem[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type AdminInterviewCandidateDetailResponse = {
  applicationId: number;
  portfolioUrl?: string | null;
  portfolioLink?: string | null;
  applicant: {
    name: string;
    department: string;
    studentNo: string;
    grade: number;
    enrollment: string;
    birthDate: string;
    phone: string;
    email: string;
  };
  applyPart: AdminApplyPart | string;
  submittedAt: string;
  answers: AdminApplicationAnswer[];
  files: AdminApplicationFile[];
  docAvgScore: number | null;
  reservation: {
    slotId: number;
    startAt: string;
    endAt: string;
  } | null;
};

export type AdminDocumentPendingPassItem = {
  applicationId: number;
  docAvgScore: number | null;
  applyPart: AdminApplyPart | string;
};

export type AdminDocumentPendingPassListResponse = {
  items: AdminDocumentPendingPassItem[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type AdminFinalPendingPassItem = {
  applicationId: number;
  interviewAvgScore: number | null;
  applyPart: AdminApplyPart | string;
};

export type AdminFinalPendingPassListResponse = {
  items: AdminFinalPendingPassItem[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type AdminDocumentScoreItem = {
  questionId: number;
  score: number;
};

export type AdminMyDocumentScoreResponse = {
  exists: boolean;
  scores: AdminDocumentScoreItem[];
  comment: string;
};

export type UpsertAdminMyDocumentScoreRequest = {
  scores: AdminDocumentScoreItem[];
  comment: string | null;
};

export type AdminDocumentScoreReview = {
  reviewer: {
    profileImageUrl: string;
    name: string;
    part: string;
  };
  scores: AdminDocumentScoreItem[];
  total: number;
  comment: string;
};

export type AdminDocumentScoresDetailResponse = {
  applicationId: number;
  average: number;
  reviewCount: number;
  canViewOthersScores: boolean;
  reviews: AdminDocumentScoreReview[];
};

export type AdminMyInterviewScoreResponse = {
  exists: boolean;
  score: number;
  comment: string;
};

export type UpsertAdminMyInterviewScoreRequest = {
  score: number;
  comment: string;
};

export type AdminInterviewScoreReview = {
  reviewerUserUuid: string;
  score: number;
  comment: string;
};

export type AdminInterviewScoreDetailResponse = {
  applicationId: number;
  average: number;
  reviewCount: number;
  canViewOthersScores: boolean;
  reviews: AdminInterviewScoreReview[];
};

