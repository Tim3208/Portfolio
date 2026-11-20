/**
 * 원본: src/features/booths/components/BoothFilterChips.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 서비스 색 · 폰트를 화면 범위 변수로만 바꿈. 팀원 Archibald1948 이 작성한 파일이다.
 */
import { BOOTH_FILTER_CHIPS, type BoothFilter } from './category'

type BoothFilterChipsProps = {
  value: BoothFilter
  onChange: (filter: BoothFilter) => void
}

/** 시안 1692:6619의 칩 줄. 화면보다 넓어서 가로로 넘겨 본다. */
export function BoothFilterChips({ value, onChange }: BoothFilterChipsProps) {
  return (
    <div
      role="tablist"
      aria-label="부스 종류"
      className="flex [scrollbar-width:none] gap-[10px] overflow-x-auto px-[15px] [&::-webkit-scrollbar]:hidden"
    >
      {BOOTH_FILTER_CHIPS.map(({ id, label }) => {
        const isActive = id === value

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={[
              'h-9 shrink-0 rounded-full px-[18px] font-(family-name:--maw-font-display) text-[14px] font-semibold whitespace-nowrap',
              isActive
                ? 'bg-gradient-to-b from-(--maw-blue) to-[#00bfea] text-(--maw-white)'
                : 'border border-(--maw-gray-02) bg-(--maw-white) text-(--maw-gray-04)',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
