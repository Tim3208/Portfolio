import { useEffect, useRef, useState, type CSSProperties, type Dispatch } from "react";

import { factor, INITIAL_CAMERA, MAP_BOOTHS, MAX_ZOOM, MIN_ZOOM, PLANE, type Basis } from "./demo";
import {
  canFocusMap,
  getCameraOffset,
  getOverviewCamera,
  getSelectionZoom,
  getVisibleMapArea,
  type MapRect,
  type VisibleMapArea,
} from "./mapCamera";
import type { BoothMapSelectionAction, BoothMapSelectionState } from "./mapSelection";
import styles from "./MapFocusScreen.module.css";
import { SNAP_RATIOS } from "./types";

export type MapReading = {
  /** 시트에 가리지 않고 실제로 보이는 지도 영역 */
  visible: VisibleMapArea | null;
  /** 보이는 영역이 좁아 이동을 미룬 상태 */
  held: boolean;
  /** 선택한 부스가 시트 뒤에 놓여 보이지 않는 상태 */
  covered: boolean;
};

function rectOf(element: HTMLElement): MapRect {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

/**
 * 부스 지도의 선택 · 이동을 보여주는 도식. 지도와 시트는 다시 그린 것이고,
 * 어디로 이동할지는 원본 mapCamera · mapSelection 이 정한다.
 *
 * 원본 BoothMap 의 카메라 처리(시트가 멈춘 뒤 그 순간의 배치를 재고, 새 이동 요청이
 * 있을 때만 움직이며, 보이는 영역이 좁으면 미룬다)를 SDK 없이 따른다. 휴대폰 화면 틀이
 * 원본의 visualViewport 자리를 맡는다. 이동 기준을 바꾸면 견주어 보도록 마지막 요청을
 * 한 번 더 실행하는데, 이것만 원본에 없는 동작이다.
 */
export function MapFocusScreen({
  selection,
  dispatch,
  basis,
  reading,
  onReading,
}: {
  selection: BoothMapSelectionState;
  dispatch: Dispatch<BoothMapSelectionAction>;
  basis: Basis;
  reading: MapReading;
  onReading: (reading: MapReading) => void;
}) {
  const { snap, selectedBoothId, focusRequestId, overviewRequestId } = selection;
  const screenRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  // 처음 한 번은 전체 보기로 맞춘다(원본 cameraRef 의 초기값과 같다).
  const handled = useRef<{ focus: number; overview: number; basis: Basis }>({ focus: 0, overview: -1, basis });
  const [camera, setCamera] = useState(INITIAL_CAMERA);
  // 측정 시점에 지금 카메라를 읽으려고 같은 값을 ref 에도 둔다.
  const cameraRef = useRef(INITIAL_CAMERA);
  const [placed, setPlaced] = useState(false);
  const [resized, setResized] = useState(0);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const observer = new ResizeObserver(() => setResized((count) => count + 1));
    observer.observe(screen);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const screen = screenRef.current;
    const map = mapRef.current;
    const sheet = sheetRef.current;
    if (!screen || !map || !sheet) return;
    let frame = 0;

    const settle = () => {
      // 시트가 움직이는 동안에는 재지 않는다.
      if (Math.abs(sheet.offsetTop - SNAP_RATIOS[snap] * screen.clientHeight) > 1) {
        frame = requestAnimationFrame(settle);
        return;
      }
      const mapRect = rectOf(map);
      const viewport = rectOf(screen);
      const visible = getVisibleMapArea(mapRect, sheet.getBoundingClientRect().top, viewport);
      // 바꾸기 전 방식은 시트를 계산에 넣지 않아 지도 전체가 기준이 된다.
      const area = basis === "visible" ? visible : getVisibleMapArea(mapRect, Number.POSITIVE_INFINITY, viewport);
      const last = handled.current;
      const request =
        last.focus !== focusRequestId
          ? "selection"
          : last.overview !== overviewRequestId
            ? "overview"
            : last.basis !== basis
              ? selectedBoothId === null
                ? "overview"
                : "selection"
              : null;

      const booth = MAP_BOOTHS.find(({ id }) => id === selectedBoothId);
      // 선택한 부스가 화면에서 놓인 높이가 보이는 영역 아래라면 시트에 가린 것이다.
      const isCovered = () => {
        if (!booth) return false;
        if (!visible) return true;
        const current = cameraRef.current;
        const y = mapRect.height / 2 + (booth.y - current.y) * factor(current.zoom);
        return y > visible.top + visible.height;
      };

      if (!request) {
        // 시트 높이나 크기만 바뀌면 측정만 갱신한다. 카메라는 움직이지 않는다.
        onReading({ visible, held: false, covered: isCovered() });
        return;
      }
      if (!area || !canFocusMap(area)) {
        onReading({ visible, held: true, covered: isCovered() });
        return;
      }
      let next = cameraRef.current;
      if (request === "selection") {
        if (booth) {
          const zoom = getSelectionZoom(next.zoom, MIN_ZOOM, MAX_ZOOM);
          const offset = getCameraOffset(area);
          const scale = factor(zoom);
          next = { x: booth.x + offset.x / scale, y: booth.y + offset.y / scale, zoom };
        }
      } else {
        const target = getOverviewCamera(MAP_BOOTHS, area, factor, MIN_ZOOM, MAX_ZOOM);
        if (target) next = { x: target.center.x, y: target.center.y, zoom: target.zoom };
      }
      cameraRef.current = next;
      setCamera(next);
      handled.current = { focus: focusRequestId, overview: overviewRequestId, basis };
      setPlaced(true);
      onReading({ visible, held: false, covered: isCovered() });
    };

    frame = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(frame);
  }, [snap, basis, selectedBoothId, focusRequestId, overviewRequestId, resized, onReading]);

  const scale = factor(camera.zoom);
  const half = PLANE.size / 2;
  const visible = reading.visible;
  const coveredBooth = reading.covered ? MAP_BOOTHS.find(({ id }) => id === selectedBoothId) : undefined;

  return (
    <div ref={screenRef} className={styles.screen} data-placed={placed ? "" : undefined}>
      <p className={styles.header}>MAP</p>

      <div ref={mapRef} role="group" aria-label="부스 지도 도식" className={styles.map}>
        <div
          aria-hidden="true"
          className={styles.plane}
          style={{ transform: `translate(${-camera.x * scale}px, ${-camera.y * scale}px) scale(${scale})` }}
        >
          <svg
            width={PLANE.size}
            height={PLANE.size}
            viewBox={`${-half} ${-half} ${PLANE.size} ${PLANE.size}`}
            className={styles.ground}
            style={{ top: -half, left: -half }}
          >
            <defs>
              <pattern id="map-focus-grid" width={PLANE.grid} height={PLANE.grid} patternUnits="userSpaceOnUse">
                <path d={`M ${PLANE.grid} 0 H 0 V ${PLANE.grid}`} fill="none" stroke="var(--color-rule-strong)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x={-half} y={-half} width={PLANE.size} height={PLANE.size} fill="url(#map-focus-grid)" />
            {PLANE.blocks.map((block) => (
              <rect
                key={`${block.x}-${block.y}`}
                {...block}
                fill="var(--color-paper)"
                stroke="var(--color-rule-strong)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {visible ? (
          <div
            aria-hidden="true"
            className={styles.visible}
            style={{ left: visible.left, top: visible.top, width: visible.width, height: visible.height }}
          >
            <span className={styles.visibleLabel}>보이는 지도 영역</span>
            <span className={styles.center} />
          </div>
        ) : null}

        {MAP_BOOTHS.map((booth) => {
          const selected = booth.id === selectedBoothId;
          return (
            <button
              key={booth.id}
              type="button"
              aria-pressed={selected}
              aria-label={booth.name}
              onClick={() => dispatch({ type: "select", id: booth.id })}
              className={styles.marker}
              style={
                {
                  left: `calc(50% + ${(booth.x - camera.x) * scale}px)`,
                  top: `calc(50% + ${(booth.y - camera.y) * scale}px)`,
                } as CSSProperties
              }
            >
              <span className={styles.dot}>{booth.name.slice(-1)}</span>
              {selected ? <span className={styles.name}>{booth.name}</span> : null}
            </button>
          );
        })}

        <button type="button" onClick={() => dispatch({ type: "overview" })} className={styles.overview}>
          전체 보기
        </button>
      </div>

      {/* 시트 뒤에 놓인 선택 부스의 자리. 도식에서만 시트 위에 비춰 보여준다. */}
      {coveredBooth ? (
        <div aria-hidden="true" className={styles.coveredLayer}>
          <span
            className={styles.covered}
            style={{
              left: `calc(50% + ${(coveredBooth.x - camera.x) * scale}px)`,
              top: `calc(50% + ${(coveredBooth.y - camera.y) * scale}px)`,
            }}
          >
            <span className={styles.coveredLabel}>시트에 가려짐</span>
          </span>
        </div>
      ) : null}

      <div ref={sheetRef} className={styles.sheet} style={{ top: `${SNAP_RATIOS[snap] * 100}%` }}>
        <span aria-hidden="true" className={styles.handle} />
        <p className={styles.sheetTitle}>부스 목록</p>
        <ul className={styles.list}>
          {MAP_BOOTHS.map((booth) => (
            <li key={booth.id}>
              <button
                type="button"
                aria-pressed={booth.id === selectedBoothId}
                onClick={() => dispatch({ type: "select", id: booth.id })}
                className={styles.row}
              >
                <span aria-hidden="true" className={styles.rowMark}>
                  {booth.name.slice(-1)}
                </span>
                {booth.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
