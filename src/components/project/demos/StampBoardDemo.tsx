import { DemoSurface } from "./shell/DemoSurface";
import { StampBoardControls } from "./StampBoardControls";

/** 정적 표면은 서버에 두고 스탬프 응답 조작만 클라이언트에 맡긴다. */
export function StampBoardDemo() {
  return (
    <DemoSurface
      hue="blush"
      caption="서버가 지급한 내역만 조회해 보여줍니다. 적립과 지급은 서버가 결정합니다."
    >
      <StampBoardControls />
    </DemoSurface>
  );
}
