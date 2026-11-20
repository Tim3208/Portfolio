/**
 * 원본: src/features/booths/components/BoothMapScreen.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 부스 조회 · 북마크 요청 · 라우터를 샘플 부스와 메모리 상태로 바꿨다. 불러오는 중 · 조회 실패
 *       안내는 샘플에서 생기지 않아 옮기지 않았고, 하단 메뉴와 뒤로 가기는 이동하지 않는 장식이다.
 *       화면 높이(h-dvh)를 시안 비율의 화면 틀로, h1 을 뺀 것, 목록의 overscroll-contain 을 뺀 것
 *       (페이지 스크롤을 붙잡지 않도록)이 배치상의 차이다. 선택 · 필터 · 시트의 흐름과 선택한 카드를
 *       목록 안에서 보이게 하는 처리는 원본 그대로다.
 *       이동 기준(basis) · 보이는 영역 표시(showArea) · 측정값 알림(onReading)은 데모에서 더했다.
 *       원본은 팀원 Archibald1948 116줄 · Tim3208 105줄 · iyeonggyu0 12줄이다.
 */
import '@fontsource-variable/hahmlet'
import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { PageHeader } from '../components/PageHeader'
import service from '../service.module.css'
import { BoothCard } from './BoothCard'
import { BoothDetailDialog } from './BoothDetailDialog'
import { BoothFilterChips } from './BoothFilterChips'
import { BoothMap, type BoothMapReading } from './BoothMap'
import { BoothSheet, type BoothSheetLayout } from './BoothSheet'
import { BottomNavigation } from './BottomNavigation'
import { filterBooths, type BoothFilter } from './category'
import { SAMPLE_BOOTHS, type Basis } from './demo'
import { boothMapSelectionReducer, INITIAL_BOOTH_MAP_SELECTION } from './mapSelection'
import type { Booth } from './types'

export type BoothScreenReading = BoothMapReading & {
  selectedName: string | null
  /** 지금까지 만든 이동 요청(부스 선택 + 전체 보기) 수 */
  requests: number
}

/** Tabler 아이콘의 선 굵기 2 를 인라인 SVG 로 옮긴 것 */
function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      {children}
    </svg>
  )
}

const navigationItems = [
  {
    id: 'booths',
    icon: (
      <NavIcon>
        <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0" />
      </NavIcon>
    ),
  },
  {
    id: 'performances',
    icon: (
      <NavIcon>
        <path d="M15 12.9a5 5 0 1 0 -3.902 -3.9" />
        <path d="M15 12.9l-3.902 -3.899l-7.513 8.584a2 2 0 1 0 2.827 2.83l8.588 -7.515" />
      </NavIcon>
    ),
  },
  {
    id: 'letters',
    icon: (
      <NavIcon>
        <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
        <path d="M3 7l9 6l9 -6" />
      </NavIcon>
    ),
  },
  {
    id: 'polls',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" focusable="false">
        <path
          d="M5 22C4.45 22 3.97933 21.8044 3.588 21.413C3.19667 21.0217 3.00067 20.5507 3 20V16.2C3 15.9667 3.04167 15.7334 3.125 15.5C3.20833 15.2667 3.33333 15.0584 3.5 14.875L5.05 13.125C5.23333 12.9084 5.471 12.796 5.763 12.788C6.055 12.78 6.30067 12.8757 6.5 13.075C6.68333 13.2584 6.78333 13.4834 6.8 13.75C6.81667 14.0167 6.73333 14.25 6.55 14.45L5.175 16H18.825L17.5 14.5C17.3167 14.3 17.2333 14.0667 17.25 13.8C17.2667 13.5334 17.3667 13.3084 17.55 13.125C17.75 12.925 17.996 12.829 18.288 12.837C18.58 12.845 18.8173 12.9577 19 13.175L20.5 14.875C20.6667 15.0584 20.7917 15.2667 20.875 15.5C20.9583 15.7334 21 15.9667 21 16.2V20C21 20.55 20.8043 21.021 20.413 21.413C20.0217 21.805 19.5507 22.0007 19 22H5ZM5 20H19V18H5V20ZM10.625 14.375L7.1 10.85C6.71667 10.4667 6.52933 9.99603 6.538 9.43803C6.54667 8.88003 6.74233 8.40903 7.125 8.02503L12.025 3.12503C12.4083 2.7417 12.8833 2.5417 13.45 2.52503C14.0167 2.50836 14.4917 2.6917 14.875 3.07503L18.4 6.60003C18.7833 6.98336 18.9833 7.45003 19 8.00003C19.0167 8.55003 18.8333 9.0167 18.45 9.40003L13.45 14.4C13.0667 14.7834 12.596 14.971 12.038 14.963C11.48 14.955 11.009 14.759 10.625 14.375ZM17 8.02503L13.475 4.50003L8.525 9.45003L12.05 12.975L17 8.02503Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 'bamboo',
    icon: (
      <NavIcon>
        <path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />
      </NavIcon>
    ),
  },
  {
    id: 'home',
    icon: (
      <NavIcon>
        <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
        <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
      </NavIcon>
    ),
  },
] as const

type BoothMapScreenProps = {
  basis: Basis
  showArea: boolean
  onReading: (reading: BoothScreenReading) => void
}

/** 지도와 부스 목록을 함께 보여 주는 부스맵 화면. 시안 1674:5087 / 1692:5411 / 1692:5680. */
export function BoothMapScreen({ basis, showArea, onReading }: BoothMapScreenProps) {
  const [booths, setBooths] = useState<readonly Booth[]>(SAMPLE_BOOTHS)
  const [selection, dispatch] = useReducer(boothMapSelectionReducer, INITIAL_BOOTH_MAP_SELECTION)
  const { filter, snap, focusRequestId, overviewRequestId } = selection
  const [sheetLayout, setSheetLayout] = useState<BoothSheetLayout | null>(null)
  const [detailBoothId, setDetailBoothId] = useState<number | null>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const navigationRef = useRef<HTMLDivElement>(null)
  const lastListRequestRef = useRef(0)

  const visibleBooths = useMemo(() => filterBooths(booths, filter), [booths, filter])
  const selectedBooth = visibleBooths.find((booth) => booth.id === selection.selectedBoothId)
  const selectedBoothId = selectedBooth?.id ?? null
  const detailBooth = booths.find((booth) => booth.id === detailBoothId)
  const hasMissingPosition =
    selectedBooth !== undefined &&
    (selectedBooth.latitude === null || selectedBooth.longitude === null)

  const handleSelectBooth = (id: number) => {
    dispatch({ type: 'select', id })
  }

  const handleFilterChange = (nextFilter: BoothFilter) => {
    dispatch({
      type: 'filter',
      filter: nextFilter,
      selectedIsVisible: filterBooths(booths, nextFilter).some(
        (booth) => booth.id === selectedBoothId && selectedBoothId !== null,
      ),
    })
  }

  // 북마크·재조회로 결과에서 빠진 부스는 선택만 해제한다. 카메라 요청은 만들지 않는다.
  useEffect(() => {
    if (selection.selectedBoothId !== null && selectedBoothId === null)
      dispatch({ type: 'removed' })
  }, [selection.selectedBoothId, selectedBoothId])

  // 지도에서 마커를 누르면 목록에서도 그 카드가 보이게 한다.
  useEffect(() => {
    const list = listRef.current
    if (selectedBoothId === null) {
      lastListRequestRef.current = focusRequestId
      return
    }
    if (
      lastListRequestRef.current === focusRequestId ||
      !list ||
      !sheetLayout ||
      sheetLayout.isMoving ||
      sheetLayout.snap !== snap
    )
      return
    const card = list.querySelector<HTMLElement>(`[data-booth-id="${selectedBoothId}"]`)
    if (!card) return
    const listRect = list.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const navigationTop = navigationRef.current?.getBoundingClientRect().top ?? listRect.bottom
    const bottom = Math.min(listRect.bottom, navigationTop - 8)
    const availableHeight = bottom - listRect.top
    if (availableHeight <= 0) return
    lastListRequestRef.current = focusRequestId
    let delta = 0
    if (cardRect.top < listRect.top || cardRect.height > availableHeight) {
      delta = cardRect.top - listRect.top
    } else if (cardRect.bottom > bottom) {
      delta = cardRect.bottom - bottom
    }
    if (Math.abs(delta) < 1) return
    // 페이지와 지도는 스크롤하지 않고 목록의 스크롤 위치만 조절한다.
    list.scrollTo({
      top: list.scrollTop + delta,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }, [selectedBoothId, focusRequestId, sheetLayout, snap])

  // 원본의 북마크 요청 자리. 샘플 목록의 북마크 여부와 수만 바꾼다.
  const handleToggleFavorite = (booth: Booth) => {
    if (booth.id === null) return
    setBooths((current) =>
      current.map((item) =>
        item.id === booth.id
          ? {
              ...item,
              favorited: !item.favorited,
              favoriteCount:
                item.favoriteCount === null
                  ? null
                  : Math.max(0, item.favoriteCount + (item.favorited ? -1 : 1)),
            }
          : item,
      ),
    )
  }

  return (
    <div
      ref={screenRef}
      className={`${service.service} relative aspect-[393/852] overflow-hidden`}
      // 서비스 공통 범위는 어두운 화면 기준이라, 밝은 부스맵 화면의 바탕 · 글자 · 폰트를 여기서 정한다.
      style={
        {
          background: 'var(--maw-white)',
          color: 'var(--maw-black)',
          colorScheme: 'light',
          fontFamily: 'var(--maw-font-body)',
        } as CSSProperties
      }
    >
      <p className="sr-only" role="status" aria-live="polite">
        <span key={focusRequestId}>
          {selectedBoothId !== null ? `${selectedBooth?.name ?? '부스'} 선택됨` : ''}
        </span>
      </p>

      <BoothMap
        booths={visibleBooths}
        selectedBoothId={selectedBoothId}
        focusRequestId={focusRequestId}
        overviewRequestId={overviewRequestId}
        isDataReady
        viewportRef={screenRef}
        sheetRef={sheetRef}
        sheetTop={sheetLayout?.top ?? null}
        isSheetMoving={!sheetLayout || sheetLayout.isMoving || sheetLayout.snap !== snap}
        onSelectBooth={handleSelectBooth}
        onShowAll={() => dispatch({ type: 'overview' })}
        className="absolute inset-x-0 top-14 bottom-0"
        basis={basis}
        showArea={showArea}
        onReading={(reading) =>
          onReading({
            ...reading,
            selectedName: selectedBooth?.name ?? null,
            requests: focusRequestId + overviewRequestId,
          })
        }
      />

      <PageHeader title="MAP" className="relative z-10" />

      <BoothSheet
        elementRef={sheetRef}
        snap={snap}
        onSnapChange={(next) => dispatch({ type: 'snap', snap: next })}
        onLayoutChange={setSheetLayout}
      >
        <div className="mt-[7px] shrink-0">
          <BoothFilterChips value={filter} onChange={handleFilterChange} />
        </div>

        {hasMissingPosition && (
          <p
            role="status"
            className="mx-[14px] mt-2 shrink-0 rounded-lg bg-(--maw-gray-01) px-3 py-2 font-(family-name:--maw-font-body) text-[12px] text-(--maw-gray-04)"
          >
            이 부스의 위치 정보가 아직 등록되지 않았습니다.
          </p>
        )}

        <ul
          ref={listRef}
          className="mt-[13px] flex min-h-0 flex-1 [scrollbar-width:none] flex-col gap-2 overflow-y-auto px-[14px] pb-[104px] [&::-webkit-scrollbar]:hidden"
        >
          {visibleBooths.length === 0 && (
            <BoothSheetNotice>
              {filter === 'FAVORITE'
                ? '아직 북마크한 부스가 없습니다.'
                : '해당하는 부스가 없습니다.'}
            </BoothSheetNotice>
          )}

          {visibleBooths.map((booth) => (
            <BoothCard
              key={booth.id ?? booth.name}
              booth={booth}
              isSelected={booth.id === selectedBoothId}
              onSelect={handleSelectBooth}
              onShowDetail={setDetailBoothId}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </ul>
      </BoothSheet>

      <div
        ref={navigationRef}
        className="pointer-events-none absolute inset-x-0 bottom-[26px] z-30"
      >
        <BottomNavigation items={navigationItems} activeId="booths" />
      </div>

      {detailBooth && (
        <BoothDetailDialog booth={detailBooth} onClose={() => setDetailBoothId(null)} />
      )}
    </div>
  )
}

function BoothSheetNotice({ children }: { children: ReactNode }) {
  return (
    <li className="flex flex-col items-center justify-center px-6 py-10 text-center font-(family-name:--maw-font-body) text-[14px] text-(--maw-gray-04)">
      {children}
    </li>
  )
}
