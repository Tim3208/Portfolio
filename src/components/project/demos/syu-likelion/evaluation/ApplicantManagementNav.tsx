/**
 * 원본: features/admin/components/ApplicantManagementNav.tsx · feat/#36 · 763061c
 * 작성: 저장소 주인 100%.
 * 변경: 원본 링크를 같은 모양의 상태 전환 버튼으로 변경하고 URL·필터 인자를 제거.
 * 색 토큰은 --syu-* 범위를 사용하며 선택된 목록에 aria-current를 제공.
 * 클라이언트 경계는 데모 조작 컴포넌트가 소유.
 */
import {
  APPLICANT_MANAGEMENT_NAV_ORDER,
  getApplicantManagementViewMeta,
  type AdminApplicantListView,
} from "./applicantManagement";

type ApplicantManagementNavProps = {
  activeView: AdminApplicantListView;
  onChangeView: (view: AdminApplicantListView) => void;
};

export default function ApplicantManagementNav({
  activeView,
  onChangeView,
}: ApplicantManagementNavProps) {
  return (
    <aside className="rounded-2xl border border-[#3a3d45] bg-[#26282d] p-4">
      <p className="text-xs font-semibold text-[var(--syu-gray-4)]">목록</p>
      <div className="mt-4 space-y-2">
        {APPLICANT_MANAGEMENT_NAV_ORDER.map((view) => {
          const meta = getApplicantManagementViewMeta(view);
          const isActive = view === activeView;

          return (
            <button
              key={view}
              type="button"
              onClick={() => onChangeView(view)}
              aria-current={isActive ? "page" : undefined}
              className={`block w-full rounded-lg px-1 py-2 text-left text-[17px] transition-colors ${
                isActive
                  ? "border-l-2 border-[var(--syu-main-1)] bg-[#2f323a] text-[var(--syu-white)]"
                  : "text-[var(--syu-gray-4)]"
              }`}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
