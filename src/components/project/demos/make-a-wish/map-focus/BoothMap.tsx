/**
 * 원본: src/features/booths/components/BoothMap.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 네이버 지도 SDK 를 한 장으로 붙인 OpenStreetMap 이미지와 CSS 변수 카메라로 대체했다.
 *       SDK 불러오기 · 인증 실패 안내 · 내 위치 표시 · 휠과 핀치 확대는 옮기지 않았고, 수동 탐색은
 *       마우스로 끄는 것만 받는다. 마커는 SDK 마커 대신 같은 모양의 버튼(BoothMarker)이다.
 *       카메라 요청 처리(선택 · 전체 보기 · 보류 · 수동 탐색)의 분기와 순서는 원본을 따른다.
 *       이동 기준 비교(basis) · 보이는 영역 표시(showArea) · 측정값 알림(onReading)은 데모에서 더했다.
 *       원본은 Tim3208 255줄(마커 유지, 카메라 요청, 수동 탐색 판별), 팀원 Archibald1948 170줄
 *       (SDK 연결과 처음의 마커 표시)이다.
 */
import { useEffect, useRef, type CSSProperties, type PointerEvent, type RefObject } from 'react'
import styles from './BoothMap.module.css'
import { BoothMarker } from './BoothMarker'
import { factor, INITIAL_VIEW, MAP_IMAGE, MAX_ZOOM, MIN_ZOOM, project, type Basis } from './demo'
import {
  canFocusMap,
  getCameraOffset,
  getOverviewCamera,
  getSelectionZoom,
  type VisibleMapArea,
} from './mapCamera'
import type { Booth } from './types'
import { useBoothMapViewport } from './useBoothMapViewport'

export type BoothMapReading = {
  /** 시트에 가리지 않고 실제로 보이는 지도 영역 */
  area: VisibleMapArea | null
  /** 보이는 영역이 좁아 이동을 미룬 상태 */
  held: boolean
  /** 선택한 부스가 시트 뒤에 놓여 보이지 않는 상태 */
  covered: boolean
}

type BoothMapProps = {
  booths: readonly Booth[]
  selectedBoothId: number | null
  focusRequestId: number
  overviewRequestId?: number
  isDataReady: boolean
  viewportRef: RefObject<HTMLDivElement | null>
  sheetRef: RefObject<HTMLDivElement | null>
  sheetTop: number | null
  isSheetMoving: boolean
  onSelectBooth: (id: number) => void
  onShowAll: () => void
  className?: string
  basis: Basis
  showArea: boolean
  onReading: (reading: BoothMapReading) => void
}

type View = { x: number; y: number; zoom: number }

/** SDK 의 setCenter · setZoom 자리. 지도와 마커가 읽는 CSS 변수를 바꾼다. */
function writeView(container: HTMLElement, view: View, animated: boolean) {
  container.toggleAttribute('data-animated', animated)
  container.style.setProperty('--map-x', String(view.x))
  container.style.setProperty('--map-y', String(view.y))
  container.style.setProperty('--map-scale', String(factor(view.zoom)))
}

function hasPosition(booth: Booth): booth is Booth & { latitude: number; longitude: number } {
  return booth.latitude !== null && booth.longitude !== null
}

/** 지도 이미지를 띄우고 부스 마커를 표시한다. 마커를 누르면 목록 쪽 선택과 맞춘다. */
export function BoothMap({
  booths,
  selectedBoothId,
  focusRequestId,
  overviewRequestId = 0,
  isDataReady,
  viewportRef,
  sheetRef,
  sheetTop,
  isSheetMoving,
  onSelectBooth,
  onShowAll,
  className,
  basis,
  showArea,
  onReading,
}: BoothMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<View>(INITIAL_VIEW)
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  // 처음 한 번은 움직임 없이 놓는다.
  const placedRef = useRef(false)
  const { area, measureArea } = useBoothMapViewport(containerRef, sheetRef, sheetTop, viewportRef)
  const cameraRef = useRef({
    mode: 'overview' as 'overview' | 'selection' | 'manual',
    focusRequestId: 0,
    overviewRequestId: 0,
    basis,
    pending: true,
    suspended: false,
  })

  // 측정값을 받는 쪽이 바뀌어도 카메라 처리를 다시 돌리지 않도록 최신 콜백만 참조한다.
  const onReadingRef = useRef(onReading)
  useEffect(() => {
    onReadingRef.current = onReading
  }, [onReading])

  // 마커 데이터 갱신과 카메라 요청을 구분한다. 시트가 멈췄을 때만 이동한다.
  useEffect(() => {
    const camera = cameraRef.current
    const container = containerRef.current
    if (!container) return
    const positioned = booths.filter((booth) => booth.id !== null && hasPosition(booth))

    /** 데모 패널에 보이는 영역 · 보류 · 가림 상태를 알린다. */
    const report = () => {
      const visible = measureArea()
      const selected = positioned.find((booth) => booth.id === selectedBoothId)
      let covered = false
      if (selected && hasPosition(selected)) {
        const view = viewRef.current
        const top =
          (visible?.mapHeight ?? 0) / 2 +
          (project(selected.latitude, selected.longitude).y - view.y) * factor(view.zoom)
        covered = !visible || top > visible.top + visible.height
      }
      const waiting = basis === 'container' ? measureArea(true) : visible
      onReadingRef.current({
        area: visible,
        held: camera.pending && !isSheetMoving && (!waiting || !canFocusMap(waiting)),
        covered,
      })
    }

    if (camera.focusRequestId !== focusRequestId) {
      camera.focusRequestId = focusRequestId
      camera.mode = selectedBoothId === null ? 'manual' : 'selection'
      camera.pending = selectedBoothId !== null
      camera.suspended = false
    }
    if (camera.overviewRequestId !== overviewRequestId) {
      camera.overviewRequestId = overviewRequestId
      camera.mode = 'overview'
      camera.pending = true
      camera.suspended = false
    }
    // 데모 전용: 이동 기준을 바꾸면 견주어 보도록 마지막 요청을 한 번 더 실행한다.
    if (camera.basis !== basis) {
      camera.basis = basis
      if (camera.mode !== 'manual') {
        camera.pending = true
        camera.suspended = false
      }
    }
    if (camera.mode === 'selection' && selectedBoothId === null) {
      camera.mode = 'manual'
      camera.pending = false
    }
    // 리스트 높이와 데이터 변경은 측정만 갱신한다. 새 이동 요청이 있어야 카메라를 움직인다.
    if (!camera.pending) {
      report()
      return
    }
    // 지난 목록을 먼저 보여 주더라도 첫 범위는 실제 응답을 받은 뒤 맞춘다.
    if (camera.mode === 'overview' && !isDataReady) return
    // 바꾸기 전 방식은 시트를 계산에 넣지 않아 지도 전체가 기준이 된다.
    const currentArea = measureArea(basis === 'container')
    if (!currentArea || isSheetMoving || !canFocusMap(currentArea)) {
      if (camera.mode !== 'manual') camera.suspended = true
      report()
      return
    }
    camera.suspended = false
    const move = (center: { x: number; y: number }, zoom: number) => {
      viewRef.current = { x: center.x, y: center.y, zoom }
      writeView(container, viewRef.current, placedRef.current)
      placedRef.current = true
    }

    if (camera.mode === 'selection') {
      const booth = positioned.find(({ id }) => id === selectedBoothId)
      if (!booth || !hasPosition(booth)) {
        // 위치가 없는 선택 요청은 폐기한다. 나중의 데이터 갱신으로 이동하지 않는다.
        camera.mode = 'manual'
        camera.pending = false
        report()
        return
      }
      const zoom = getSelectionZoom(viewRef.current.zoom, MIN_ZOOM, MAX_ZOOM)
      const point = project(booth.latitude, booth.longitude)
      const offset = getCameraOffset(currentArea)
      const scale = factor(zoom)
      if (!Number.isFinite(scale) || scale <= 0) {
        camera.pending = false
        return
      }
      move({ x: point.x + offset.x / scale, y: point.y + offset.y / scale }, zoom)
      camera.pending = false
    } else if (camera.mode === 'overview') {
      const points = positioned.flatMap((booth) =>
        hasPosition(booth) ? [project(booth.latitude, booth.longitude)] : [],
      )
      const target = getOverviewCamera(points, currentArea, factor, MIN_ZOOM, MAX_ZOOM)
      if (!target) {
        // 위치나 투영이 유효하지 않으면 요청을 소비해 뒤늦은 자동 이동을 막는다.
        camera.pending = false
        report()
        return
      }
      move(target.center, target.zoom)
      camera.pending = false
    }
    report()
  }, [
    booths,
    selectedBoothId,
    focusRequestId,
    overviewRequestId,
    isDataReady,
    area,
    measureArea,
    isSheetMoving,
    basis,
  ])

  // 프로그램 이동 대신 실제 끌기로 수동 탐색을 판별한다. 끄는 동안에는 자동 이동을 멈춘다.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    if (event.target instanceof Element && event.target.closest('button, a')) return
    cameraRef.current.mode = 'manual'
    cameraRef.current.pending = false
    dragRef.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.toggleAttribute('data-dragging', true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const view = viewRef.current
    const scale = factor(view.zoom)
    viewRef.current = {
      // 지도 이미지 밖으로는 나가지 않는다.
      x: Math.min(MAP_IMAGE.width, Math.max(0, view.x - (event.clientX - drag.x) / scale)),
      y: Math.min(MAP_IMAGE.height, Math.max(0, view.y - (event.clientY - drag.y) / scale)),
      zoom: view.zoom,
    }
    writeView(event.currentTarget, viewRef.current, false)
    dragRef.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    dragRef.current = null
    event.currentTarget.toggleAttribute('data-dragging', false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const labelWidth = area?.width ?? 196

  return (
    <div className={className}>
      <div
        ref={containerRef}
        role="group"
        aria-label="부스 지도"
        className={styles.map}
        style={
          {
            '--map-x': INITIAL_VIEW.x,
            '--map-y': INITIAL_VIEW.y,
            '--map-scale': factor(INITIAL_VIEW.zoom),
          } as CSSProperties
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div aria-hidden="true" className={styles.plane}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 배율에 따라 통째로 늘리고 줄이는 지도 바탕이다 */}
          <img
            src={MAP_IMAGE.src}
            alt=""
            width={MAP_IMAGE.width}
            height={MAP_IMAGE.height}
            draggable={false}
            className={styles.tiles}
          />
        </div>

        {showArea && area ? (
          <div
            aria-hidden="true"
            className={styles.visible}
            style={{ left: area.left, top: area.top, width: area.width, height: area.height }}
          >
            <span className={styles.visibleCenter} />
          </div>
        ) : null}

        {booths.map((booth) =>
          booth.id !== null && hasPosition(booth) ? (
            <BoothMarker
              key={booth.id}
              booth={booth}
              point={project(booth.latitude, booth.longitude)}
              isSelected={booth.id === selectedBoothId}
              labelWidth={labelWidth}
              onSelect={onSelectBooth}
            />
          ) : null,
        )}

        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer noopener"
          className={styles.attribution}
        >
          © OpenStreetMap
        </a>
      </div>
      <button
        type="button"
        onClick={onShowAll}
        disabled={!isDataReady}
        className="absolute top-4 right-4 z-10 rounded-full bg-(--maw-white) px-4 py-2.5 font-(family-name:--maw-font-body) text-[14px] font-semibold text-(--maw-purple) shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--maw-blue) disabled:opacity-50"
      >
        전체 보기
      </button>
    </div>
  )
}
