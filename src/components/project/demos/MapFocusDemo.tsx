import { MapFocusControls } from "./MapFocusControls";
import { DemoSurface } from "./shell/DemoSurface";

/**
 * 부스 지도의 선택 · 이동 — Make A Wish 상세 05 (docs/design.md#option-3-demos).
 *
 * 원본 부스맵 화면을 샘플 부스로 실행한다. 지도 · 시트 · 카드는 팀원이 먼저 만든 화면이라
 * 공동 작성임을 밝히고, 네이버 지도 SDK 자리에는 OpenStreetMap 이미지를 둔다.
 */
export function MapFocusDemo() {
  return (
    <DemoSurface
      hue="blush"
      label="실제 서비스 코드 · 팀원과 공동 작성 · 샘플 부스"
      caption="부스 지도와 목록 시트 · 카드는 팀원이 먼저 만들었고, 선택한 부스가 목록에 가리지 않게 지도를 옮기는 계산과 선택 · 이동의 분리를 맡았습니다. 지도 바탕은 네이버 지도 대신 OpenStreetMap 이미지이고, 부스는 지어낸 샘플입니다."
    >
      <MapFocusControls />
    </DemoSurface>
  );
}
