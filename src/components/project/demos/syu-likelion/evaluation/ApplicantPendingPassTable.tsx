/**
 * 원본: features/admin/components/ApplicantPendingPassTable.tsx · feat/#36 · 763061c
 * 작성: 저장소 주인 100%.
 * 변경: 타입 import와 색 토큰을 --syu-* 범위로 변경. 원본 크기·compact 분기·정렬을 유지하고,
 * 행 선택에 키보드 Enter·Space와 선택 상태를 보완. 클라이언트 경계는 데모 조작 컴포넌트가 소유.
 */
import type { AdminDocumentPendingPassListResponse } from "./type";

function formatPart(value: string) {
  if (value === "FRONTEND") return "FRONTEND";
  if (value === "BACKEND") return "BACKEND";
  if (value === "AI_ML") return "AI / ML";
  if (value === "PM_DESIGN") return "PM / DESIGN";
  return value;
}

type ApplicantPendingPassTableProps = {
  result: AdminDocumentPendingPassListResponse;
  isLoading: boolean;
  hasRecruitmentId: boolean;
  selectedApplicationId?: number | null;
  compact?: boolean;
  onSelectApplication?: (applicationId: number) => void;
};

export default function ApplicantPendingPassTable({
  result,
  isLoading,
  hasRecruitmentId,
  selectedApplicationId,
  compact = false,
  onSelectApplication,
}: ApplicantPendingPassTableProps) {
  const columnCount = compact ? 3 : 4;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#4a4f5b]">
      <table className="w-full table-fixed text-center text-sm">
        <thead className="bg-[#343843] text-[var(--syu-gray-2)]">
          <tr className="[&>th]:px-2 [&>th]:py-3">
            {!compact && <th className="w-[70px]">No.</th>}
            <th className="w-[120px]">지원서 ID</th>
            <th>파트</th>
            <th className="w-[120px]">서류 평균</th>
          </tr>
        </thead>
        <tbody className="bg-[#2d3037] text-[var(--syu-gray-1)]">
          {isLoading && (
            <tr>
              <td colSpan={columnCount} className="px-3 py-12 text-[var(--syu-gray-4)]">
                불러오는 중입니다.
              </td>
            </tr>
          )}

          {!isLoading && result.items.length === 0 && hasRecruitmentId && (
            <tr>
              <td colSpan={columnCount} className="px-3 py-12 text-[var(--syu-gray-4)]">
                조회된 서류 예비 합격자가 없습니다.
              </td>
            </tr>
          )}

          {!isLoading &&
            result.items.map((item, index) => (
              <tr
                key={item.applicationId}
                onClick={() => onSelectApplication?.(item.applicationId)}
                tabIndex={0}
                aria-selected={selectedApplicationId === item.applicationId}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectApplication?.(item.applicationId);
                  }
                }}
                className={`cursor-pointer border-t border-[#4b4f59] transition-colors [&>td]:px-2 [&>td]:py-3 ${
                  selectedApplicationId === item.applicationId
                    ? "bg-[#3a404d]"
                    : "hover:bg-[#3a3f49]"
                }`}
              >
                {!compact && <td>{result.page.page * result.page.size + index + 1}</td>}
                <td>{item.applicationId}</td>
                <td>{formatPart(item.applyPart)}</td>
                <td>
                  {typeof item.docAvgScore === "number"
                    ? item.docAvgScore.toFixed(1)
                    : "-"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
