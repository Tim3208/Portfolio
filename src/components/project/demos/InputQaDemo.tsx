import { PROJECTS } from "@/data/projects";

import { InputQaControls } from "./InputQaControls";
import { DemoSurface } from "./shell/DemoSurface";

/** 서비스 화면과 조작을 묶는 정적 표면은 서버에 둔다. */
export function InputQaDemo() {
  return (
    <DemoSurface
      hue={PROJECTS.find((project) => project.slug === "make-a-wish")?.hue ?? "blush"}
      caption="환영창은 받은 이름을 글자 그대로 보여주고, 납부 값이 정확히 true일 때만 납부자 화면을 엽니다. 입력란 보기는 원본 입력란 네 개와 검증 함수를 한 화면에 모은 것입니다."
    >
      <InputQaControls />
    </DemoSurface>
  );
}
