/**
 * 원본: features/admin/applicantManagement.ts · feat/#36 · 763061c
 * 작성: 저장소 주인 100%.
 * 변경: 원본 다섯 목록의 타입·순서·문구·메타데이터를 유지. URL 해석·생성 함수는 데모에서 쓰지 않아 제외.
 */
import type { AdminApplicationStatus } from "./type";

export type ExtendedAdminApplicationStatus = AdminApplicationStatus;

export type AdminApplicationsListView =
  | "DOCUMENT_APPLICANTS"
  | "DOCUMENT_PENDING";

export type AdminInterviewsListView =
  | "INTERVIEW_CANDIDATES"
  | "FINAL_PENDING"
  | "FINAL_PASSED";

export type AdminApplicantListView =
  | AdminApplicationsListView
  | AdminInterviewsListView;

type ApplicantManagementViewMeta = {
  label: string;
  pageTitle: string;
  path: string;
  viewParam?: string;
};

const APPLICANT_MANAGEMENT_VIEW_META: Record<
  AdminApplicantListView,
  ApplicantManagementViewMeta
> = {
  DOCUMENT_APPLICANTS: {
    label: "서류 지원자 목록",
    pageTitle: "서류 지원자 목록",
    path: "/admin/applications",
  },
  DOCUMENT_PENDING: {
    label: "서류 예비 합격자 목록",
    pageTitle: "서류 예비 합격자 목록",
    path: "/admin/applications",
    viewParam: "document-pending",
  },
  INTERVIEW_CANDIDATES: {
    label: "서류 합격자 목록",
    pageTitle: "서류 합격자 목록",
    path: "/admin/interviews/candidates",
  },
  FINAL_PENDING: {
    label: "최종 예비 합격자 목록",
    pageTitle: "최종 예비 합격자 목록",
    path: "/admin/interviews/candidates",
    viewParam: "final-pending",
  },
  FINAL_PASSED: {
    label: "최종 합격자 목록",
    pageTitle: "최종 합격자 목록",
    path: "/admin/interviews/candidates",
    viewParam: "final-passed",
  },
};

export const APPLICANT_MANAGEMENT_NAV_ORDER: AdminApplicantListView[] = [
  "DOCUMENT_APPLICANTS",
  "DOCUMENT_PENDING",
  "INTERVIEW_CANDIDATES",
  "FINAL_PENDING",
  "FINAL_PASSED",
];

export function getApplicantManagementViewMeta(view: AdminApplicantListView) {
  return APPLICANT_MANAGEMENT_VIEW_META[view];
}
