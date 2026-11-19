/**
 * 원본: src/features/filter-categories/ui/CategoryFilter.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 흰색·검정색 팔레트를 루트의 --oshi-* 변수로 격리했다. 상세 페이지 h2 아래 영역·하위 제목을 h3·h4로 낮췄다.
 */
import {
  BadgePlus,
  CalendarDays,
  CirclePlus,
  Clock3,
  Gift,
  Wrench,
} from "lucide-react";
import type {
  CategoryFilter as CategoryFilterModel,
  CategoryId,
} from "../../../entities/event/model";
import { IconButton } from "../../../shared/ui";

type CategoryFilterProps = {
  categories: CategoryFilterModel[];
  visibleCategoryIds: CategoryId[];
  onToggleCategory: (categoryId: CategoryId) => void;
};

/**
 * 카테고리 ID와 lucide 아이콘을 연결하는 UI 전용 매핑이다.
 *
 * `satisfies`로 모든 CategoryId가 아이콘을 갖도록 강제해 새 카테고리 추가 시
 * 아이콘 누락을 타입 단계에서 드러낸다.
 */
const categoryIcons = {
  event: Gift,
  pickup: CalendarDays,
  update: CirclePlus,
  redeem: Clock3,
  maintenance: Wrench,
} satisfies Record<CategoryId, typeof CalendarDays>;

/**
 * 일정 카테고리 표시 여부를 토글하는 feature UI다.
 *
 * 실제 필터 상태는 상위 레이어가 소유하고, 이 컴포넌트는 전달받은
 * `visibleCategoryIds`를 기준으로 checked 상태를 그린 뒤 category id만 돌려준다.
 */
export function CategoryFilter({
  categories,
  visibleCategoryIds,
  onToggleCategory,
}: CategoryFilterProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h3
          id="category-title"
          className="m-0 text-[13px] font-medium tracking-normal text-[color:var(--oshi-white)]/72"
        >
          카테고리
        </h3>
        <div className="flex items-center gap-1.5">
          <span
            id="category-add-status"
            className="text-[10px] text-[color:var(--oshi-white)]/38"
          >
            준비 중
          </span>
          <IconButton
            label="카테고리 추가 준비 중"
            aria-describedby="category-add-status"
            disabled
          >
            <BadgePlus aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <div className="mt-3 grid gap-1.5">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id];
          const checked = visibleCategoryIds.includes(category.id);

          return (
            <label
              key={category.id}
              className={[
                "grid min-h-8 cursor-pointer grid-cols-[14px_7px_16px_minmax(0,1fr)] items-center gap-2 rounded-lg border-transparent px-2 py-1.5 text-[12px] transition-colors",
                checked
                  ? "text-[#eefcf8]"
                  : "bg-[#242424]/70 text-[#a8a8a8] hover:border-[#303030] hover:bg-[#292929]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleCategory(category.id)}
                className="sr-only"
              />
              <span
                className={[
                  "relative h-3.5 w-3.5 rounded-[4px] border transition-colors",
                  checked
                    ? "border-[#27FFBB] bg-[#27FFBB] after:absolute after:top-[1px] after:left-[4px] after:h-[8px] after:w-[4px] after:rotate-45 after:border-r-[1.5px] after:border-b-[1.5px] after:border-[color:var(--oshi-black)]/75 after:content-['']"
                    : "border-[color:var(--oshi-white)]/32 bg-transparent",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              />
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              <Icon
                className={[
                  "h-4 w-4",
                  checked ? "text-[#27FFBB]" : "text-[#8f8f8f]",
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="min-w-0 truncate">{category.label}</span>
            </label>
          );
        })}
      </div>
    </>
  );
}
