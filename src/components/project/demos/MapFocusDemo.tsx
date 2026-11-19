import { MapFocusControls } from "./MapFocusControls";
import { DemoSurface } from "./shell/DemoSurface";

/**
 * 부스 지도의 선택 · 이동 — Make A Wish 상세 05 (docs/design.md#option-3-demos).
 *
 * 지도 SDK 와 팀원이 만든 시트 · 카드는 옮기지 않고 도식으로 다시 그렸다. 보이는 영역,
 * 이동 오프셋, 전체 보기 범위, 선택과 이동 요청의 분리는 원본 코드가 계산한다.
 */
export function MapFocusDemo() {
  return (
    <DemoSurface
      hue="blush"
      label="설명용 재구성 · 원본 계산 코드 · 샘플 부스"
      caption="지도와 화면은 도식이고, 이동할 자리는 원본 계산 코드가 그 순간의 배치를 다시 재서 정합니다. 실제 지도와 부스 위치가 아닙니다."
    >
      <MapFocusControls />
    </DemoSurface>
  );
}
