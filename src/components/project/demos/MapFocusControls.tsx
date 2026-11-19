"use client";

import { useId, useReducer, useState } from "react";

import { RadioChoices } from "@/components/ui/Switcher";

import { BASES, MAP_BOOTHS, SNAPS, type Basis } from "./make-a-wish/map-focus/demo";
import { getCameraOffset } from "./make-a-wish/map-focus/mapCamera";
import { MapFocusScreen, type MapReading } from "./make-a-wish/map-focus/MapFocusScreen";
import { boothMapSelectionReducer, INITIAL_BOOTH_MAP_SELECTION } from "./make-a-wish/map-focus/mapSelection";
import type { BoothSheetSnap } from "./make-a-wish/map-focus/types";
import styles from "./MapFocusDemo.module.css";
import { DeferredDemoFrame } from "./shell/DeferredDemoFrame";
import { DemoLayout } from "./shell/DemoLayout";
import { DemoPanel } from "./shell/DemoPanel";

/** "처음으로"는 선택 · 이동 요청 · 카메라를 모두 처음 상태로 되돌리도록 다시 마운트한다. */
export function MapFocusControls() {
  const [visit, setVisit] = useState(0);
  return <MapFocusSession key={visit} onReset={() => setVisit((count) => count + 1)} />;
}

/**
 * 선택과 이동 요청은 원본 reducer 가, 이동할 자리는 도식 안의 원본 계산이 정한다.
 * 이동 기준과 시트 높이처럼 견주어 보는 조작은 도식 밖 패널에 둔다.
 */
function MapFocusSession({ onReset }: { onReset: () => void }) {
  const [selection, dispatch] = useReducer(boothMapSelectionReducer, INITIAL_BOOTH_MAP_SELECTION);
  const [basis, setBasis] = useState<Basis>("visible");
  const [reading, setReading] = useState<MapReading>({ visible: null, held: false, covered: false });
  const basisId = useId();
  const snapId = useId();

  const selected = MAP_BOOTHS.find(({ id }) => id === selection.selectedBoothId);
  const visible = reading.visible;
  const offset = visible && basis === "visible" ? getCameraOffset(visible) : { x: 0, y: 0 };
  const requests = selection.focusRequestId + selection.overviewRequestId;

  return (
    <DemoLayout>
      <DeferredDemoFrame className={styles.frame} placeholder={<div className={styles.placeholder} aria-hidden="true" />}>
        <MapFocusScreen selection={selection} dispatch={dispatch} basis={basis} reading={reading} onReading={setReading} />
      </DeferredDemoFrame>
      <DemoPanel
        label="지도 이동 기준"
        intro={
          <>
            <p className="font-semibold">지도가 멈추는 자리</p>
            <p className="text-sm text-ink-2">
              부스를 누르면 지도가 그 부스로 이동합니다. 이동 기준과 목록 시트 높이를 바꾼 뒤 같은 부스를 다시 눌러 보세요.
            </p>
          </>
        }
        controls={
          <>
            <div className={styles.choice}>
              <p className="hidden text-xs text-ink-2 md:block" aria-hidden="true">
                이동 기준
              </p>
              <RadioChoices
                name={basisId}
                legend="이동 기준"
                options={BASES}
                value={basis}
                onValueChange={(value) => setBasis(value as Basis)}
                compactDesktop={false}
              />
            </div>
            <div className={styles.choice}>
              <p className="hidden text-xs text-ink-2 md:block" aria-hidden="true">
                목록 시트 높이
              </p>
              <RadioChoices
                name={snapId}
                legend="목록 시트 높이"
                options={SNAPS}
                value={selection.snap}
                onValueChange={(value) => dispatch({ type: "snap", snap: value as BoothSheetSnap })}
                compactDesktop={false}
              />
            </div>
            <button
              type="button"
              onClick={onReset}
              className="min-h-11 w-fit rounded-xs border border-rule-strong px-3 text-sm hover:border-hue-deep hover:text-hue-deep"
            >
              처음으로
            </button>
          </>
        }
        body={
          <div className="flex flex-col gap-3 border-t border-rule pt-3 text-sm">
            <p role="status" className="font-semibold">
              {reading.held
                ? "보이는 영역이 좁아 이동을 미뤘습니다. 시트를 내리면 이어서 이동합니다."
                : selected
                  ? `${selected.name} 선택됨${reading.covered ? " · 목록 시트에 가려 보이지 않습니다" : ""}`
                  : "전체 보기"}
            </p>
            <dl className={styles.readout}>
              <dt>보이는 지도 영역</dt>
              <dd>
                {visible
                  ? `${Math.round(visible.width)} × ${Math.round(visible.height)}px (지도 ${Math.round(visible.mapWidth)} × ${Math.round(visible.mapHeight)}px 중)`
                  : "없음"}
              </dd>
              <dt>이동 오프셋</dt>
              <dd>
                x {Math.round(offset.x)} · y {Math.round(offset.y)}px
                {basis === "container" ? " (시트를 계산에 넣지 않음)" : ""}
              </dd>
              <dt>이동 요청</dt>
              <dd>{requests}회</dd>
            </dl>
            <p className="text-xs text-ink-2">
              이동 요청은 부스를 누르거나 전체 보기를 누를 때만 늘어납니다. 시트 높이를 바꾸면 보이는 영역만 다시 잽니다.
            </p>
          </div>
        }
      />
    </DemoLayout>
  );
}
