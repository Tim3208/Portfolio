"use client";

import { useCallback, useId, useState } from "react";

import { RadioChoices } from "@/components/ui/Switcher";

import { BoothMapScreen, type BoothScreenReading } from "./make-a-wish/map-focus/BoothMapScreen";
import { BASES, type Basis } from "./make-a-wish/map-focus/demo";
import { getCameraOffset } from "./make-a-wish/map-focus/mapCamera";
import styles from "./MapFocusDemo.module.css";
import { DeferredDemoFrame } from "./shell/DeferredDemoFrame";
import { DemoLayout } from "./shell/DemoLayout";
import { DemoPanel } from "./shell/DemoPanel";

const INITIAL_READING: BoothScreenReading = { area: null, held: false, covered: false, selectedName: null, requests: 0 };

/** "처음으로"는 선택 · 필터 · 북마크 · 지도 위치를 모두 처음 상태로 되돌리도록 다시 마운트한다. */
export function MapFocusControls() {
  const [visit, setVisit] = useState(0);
  return <MapFocusSession key={visit} onReset={() => setVisit((count) => count + 1)} />;
}

/**
 * 원본 부스맵 화면에 샘플 부스를 넣어 실행한다. 선택 · 필터 · 시트 높이는 화면 안에서 원본처럼
 * 조작하고, 원본에 없는 이동 기준 비교와 보이는 영역 표시는 화면 밖 패널에 둔다.
 */
function MapFocusSession({ onReset }: { onReset: () => void }) {
  const [basis, setBasis] = useState<Basis>("visible");
  const [showArea, setShowArea] = useState(false);
  const [reading, setReading] = useState(INITIAL_READING);
  const basisId = useId();

  // 같은 측정값이면 다시 그리지 않는다.
  const handleReading = useCallback((next: BoothScreenReading) => {
    setReading((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
  }, []);

  const area = reading.area;
  const offset = area && basis === "visible" ? getCameraOffset(area) : { x: 0, y: 0 };

  return (
    <DemoLayout>
      <DeferredDemoFrame className={styles.frame} placeholder={<div className={styles.placeholder} aria-hidden="true" />}>
        <BoothMapScreen basis={basis} showArea={showArea} onReading={handleReading} />
      </DeferredDemoFrame>
      <DemoPanel
        label="지도 이동 기준"
        intro={
          <>
            <p className="font-semibold">지도가 멈추는 자리</p>
            <p className="text-sm text-ink-2">
              부스 카드의 이름이나 지도 위 표시를 누르면 지도가 그 부스로 이동합니다. 목록의 손잡이를 끌어 높이를 바꾼 뒤 같은 부스를 다시 눌러 보세요.
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
            <div className={styles.row}>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showArea}
                  onChange={(event) => setShowArea(event.target.checked)}
                  className="size-4 accent-hue-deep"
                />
                보이는 지도 영역 표시
              </label>
              <button
                type="button"
                onClick={onReset}
                className="min-h-11 shrink-0 rounded-xs border border-rule-strong px-3 text-sm hover:border-hue-deep hover:text-hue-deep"
              >
                처음으로
              </button>
            </div>
          </>
        }
        body={
          <div className="flex flex-col gap-3 border-t border-rule pt-3 text-sm">
            <p role="status" className="font-semibold">
              {reading.held
                ? "보이는 영역이 좁아 이동을 미뤘습니다. 목록을 내리면 이어서 이동합니다."
                : reading.selectedName
                  ? `${reading.selectedName} 선택됨${reading.covered ? " · 목록에 가려 보이지 않습니다" : ""}`
                  : "전체 보기"}
            </p>
            <dl className={styles.readout}>
              <dt>보이는 지도 영역</dt>
              <dd>
                {area
                  ? `${Math.round(area.width)} × ${Math.round(area.height)}px (지도 ${Math.round(area.mapWidth)} × ${Math.round(area.mapHeight)}px 중)`
                  : "없음"}
              </dd>
              <dt>이동 오프셋</dt>
              <dd>
                x {Math.round(offset.x)} · y {Math.round(offset.y)}px
                {basis === "container" ? " (목록을 계산에 넣지 않음)" : ""}
              </dd>
              <dt>이동 요청</dt>
              <dd>{reading.requests}회</dd>
            </dl>
            <p className="text-xs text-ink-2">
              이동 요청은 부스를 누르거나 전체 보기를 누를 때만 늘어납니다. 북마크를 누르거나 목록 높이를 바꾸면 보이는 영역만 다시 잽니다.
            </p>
          </div>
        }
      />
    </DemoLayout>
  );
}
