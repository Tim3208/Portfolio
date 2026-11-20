/**
 * 원본: src/features/booths/hooks/useBoothMapViewport.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 원본은 브라우저의 visualViewport 를 기준으로 재지만, 데모는 스크롤되는 페이지 안에 놓여
 *       휴대폰 화면 틀(viewportRef)을 기준으로 잰다. 그래서 모든 값이 화면 틀 왼쪽 위에서 잰 값이고,
 *       visualViewport 리스너는 뺐다. 이동 기준을 견주는 데모용으로 measureArea 에 시트를 계산에서
 *       빼는 선택지를 더했다. 재는 순서와 getVisibleMapArea 호출은 그대로다.
 */
import { useCallback, useLayoutEffect, useMemo, useState, type RefObject } from 'react'
import { getVisibleMapArea, type MapRect } from './mapCamera'

type Measurements = { map: MapRect; viewport: MapRect }

function readMeasurements(container: HTMLDivElement, screen: HTMLDivElement): Measurements {
  const rect = container.getBoundingClientRect()
  const visual = screen.getBoundingClientRect()
  return {
    map: {
      left: rect.left - visual.left,
      top: rect.top - visual.top,
      width: rect.width,
      height: rect.height,
    },
    viewport: { left: 0, top: 0, width: visual.width, height: visual.height },
  }
}

/** 화면 틀과 시트에 가리지 않고 실제 노출되는 지도 영역을 잰다. */
export function useBoothMapViewport(
  containerRef: RefObject<HTMLDivElement | null>,
  sheetRef: RefObject<HTMLDivElement | null>,
  sheetTop: number | null,
  viewportRef: RefObject<HTMLDivElement | null>,
) {
  const [measurements, setMeasurements] = useState<Measurements | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    let frame = 0

    const measure = () => {
      // 화면 틀의 ref 는 이 effect 보다 늦게 붙으므로 잴 때 읽는다.
      const screen = viewportRef.current
      if (!screen) return
      const next = readMeasurements(container, screen)
      setMeasurements((previous) =>
        previous && JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      )
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(container)
    schedule()
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [containerRef, viewportRef])

  const area = useMemo(
    () =>
      measurements && sheetTop !== null
        ? getVisibleMapArea(measurements.map, sheetTop, measurements.viewport)
        : null,
    [measurements, sheetTop],
  )

  // 화면 회전 직후의 요청은 다음 관찰 프레임을 기다리지 않고 현재 DOM으로 계산한다.
  const measureArea = useCallback(
    (ignoreSheet = false) => {
      const container = containerRef.current
      const sheet = sheetRef.current
      const screen = viewportRef.current
      if (!container || !sheet || !screen) return null
      const current = readMeasurements(container, screen)
      const sheetTopNow = ignoreSheet
        ? Number.POSITIVE_INFINITY
        : sheet.getBoundingClientRect().top - screen.getBoundingClientRect().top
      return getVisibleMapArea(current.map, sheetTopNow, current.viewport)
    },
    [containerRef, sheetRef, viewportRef],
  )

  return { area, measureArea }
}
