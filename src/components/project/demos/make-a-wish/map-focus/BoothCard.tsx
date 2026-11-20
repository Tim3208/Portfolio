/**
 * 원본: src/features/booths/components/BoothCard.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 서비스 색 · 폰트를 화면 범위 변수로, 북마크 아이콘을 공개 경로로 바꿈. 샘플 부스에는 사진이 없어
 *       CDN 축소 주소(thumbnail.ts)와 실패 시 원본 재시도는 옮기지 않고 받은 주소를 그대로 쓴다.
 *       팀원 Archibald1948 82줄 · iyeonggyu0 26줄 · Tim3208 5줄.
 */
import { getBoothCategoryLabel } from './category'
import type { Booth } from './types'

const bookmarkFilledIcon = '/images/projects/make-a-wish/booths/bookmark-filled.svg'
const bookmarkIcon = '/images/projects/make-a-wish/booths/bookmark.svg'

type BoothCardProps = {
  booth: Booth
  isSelected: boolean
  onSelect: (id: number) => void
  onShowDetail: (id: number) => void
  onToggleFavorite: (booth: Booth) => void
  /** 기기에 남겨 둔 지난 목록을 보여 주는 동안에는 북마크 상태를 모르므로 막는다. */
  isFavoriteDisabled?: boolean
}

/** 시안은 두 자리까지만 보여 준다('99+'). */
function formatFavoriteCount(count: number) {
  return count > 99 ? '99+' : String(count)
}

/** 시안 1692:6632의 부스 카드. 누르면 지도를 그 부스로 옮긴다. */
export function BoothCard({
  booth,
  isSelected,
  onSelect,
  onShowDetail,
  onToggleFavorite,
  isFavoriteDisabled = false,
}: BoothCardProps) {
  const name = booth.name ?? '이름 미정'
  // 설명이 비어 있는 부스는 주최 쪽을 대신 보여 준다.
  const summary = booth.description ?? booth.operator

  return (
    // 북마크와 상세보기 버튼은 지도 선택 버튼과 분리한다.
    <li className="relative shrink-0" data-booth-id={booth.id ?? undefined}>
      <div
        className={[
          'flex h-[166px] w-full gap-[18px] rounded-[20px] border bg-(--maw-white) pt-[19px] pl-[19px] text-left font-(family-name:--maw-font-body)',
          isSelected ? 'border-(--maw-blue)' : 'border-(--maw-gray-01)',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={() => booth.id !== null && onShowDetail(booth.id)}
          aria-label={`${name} 상세보기`}
          aria-haspopup="dialog"
          className="grid size-[70px] shrink-0 place-items-center overflow-hidden rounded-full border border-(--maw-gray-01) bg-(--maw-white) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--maw-main-02)"
        >
          {booth.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- 원본 카드의 크기 · 맞춤 방식을 그대로 쓴다
            <img
              src={booth.imageUrl}
              alt=""
              loading="lazy"
              className="size-full object-contain p-[4.375px]"
            />
          )}
        </button>

        <span className="flex min-w-0 flex-1 flex-col pr-[52px]">
          <button
            type="button"
            onClick={() => booth.id !== null && onSelect(booth.id)}
            aria-pressed={isSelected}
            className="flex min-h-11 shrink-0 items-center text-left text-[16px] leading-[normal] font-semibold text-(--maw-purple) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--maw-main-02)"
          >
            <span className="min-w-0 truncate">{name}</span>
          </button>
          {summary && (
            <button
              type="button"
              onClick={() => booth.id !== null && onShowDetail(booth.id)}
              aria-label={`${name} 소개 상세보기`}
              aria-haspopup="dialog"
              className="mt-[6px] line-clamp-3 text-left text-[14px] leading-[normal] text-(--maw-gray-04) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--maw-main-02)"
            >
              {summary}
            </button>
          )}
          <span className="mt-auto mb-[15px] w-fit rounded-full bg-(--maw-gray-01) px-[10px] py-[4px] text-[12px] leading-[normal] text-(--maw-gray-04)">
            {getBoothCategoryLabel(booth.category)}
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={() => onToggleFavorite(booth)}
        disabled={isFavoriteDisabled}
        aria-pressed={booth.favorited}
        aria-label={`${name} 북마크`}
        className="absolute top-[7px] right-[7px] flex w-11 flex-col items-center pt-[10px] pb-[6px] font-(family-name:--maw-font-body) disabled:opacity-40"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 원본 북마크 아이콘(SVG) */}
        <img src={booth.favorited ? bookmarkFilledIcon : bookmarkIcon} alt="" className="size-6" />
        {booth.favoriteCount !== null && (
          <span className="mt-[8px] text-[12px] leading-[normal] font-light text-(--maw-gray-04)">
            {formatFavoriteCount(booth.favoriteCount)}
          </span>
        )}
      </button>
    </li>
  )
}
