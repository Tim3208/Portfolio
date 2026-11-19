/**
 * 원본: features/admin/permissions.ts · feat/#36 · 763061c
 * 작성: 저장소 주인 100%.
 * 변경: 합격 처리 권한에 쓰이는 순수 로직만 그대로 이식. 인증과 접근 Guard는 옮기지 않음.
 * 공개 프로필 타입은 함수가 읽는 ssoRole·level·position 구조만 받도록 좁힘.
 */
export type ApplicantDecisionProfile = {
  sso: { ssoRole: string };
  roles: { level: string; position: string }[];
};

const APPLICANT_DECISION_LEVELS = new Set(["ADMIN", "ROLE_ADMIN"]);

const APPLICANT_DECISION_POSITIONS = new Set([
  "PRESIDENT",
  "VICE_PRESIDENT",
]);

function normalizePermissionValue(value?: string | null): string {
  return (value ?? "").trim().toUpperCase();
}

function hasSsoAdminRole(profile: ApplicantDecisionProfile): boolean {
  const ssoRole = normalizePermissionValue(profile.sso.ssoRole);
  return ssoRole === "ADMIN" || ssoRole === "ROLE_ADMIN";
}

function hasApplicantDecisionRole(
  role: ApplicantDecisionProfile["roles"][number],
): boolean {
  return (
    APPLICANT_DECISION_LEVELS.has(normalizePermissionValue(role.level)) ||
    APPLICANT_DECISION_POSITIONS.has(normalizePermissionValue(role.position))
  );
}

export function canManageApplicantDecisions(
  profile: ApplicantDecisionProfile,
): boolean {
  return hasSsoAdminRole(profile) || profile.roles.some(hasApplicantDecisionRole);
}
