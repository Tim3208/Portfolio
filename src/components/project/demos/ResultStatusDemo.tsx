import { PROJECTS } from "@/data/projects";

import { ResultStatusControls } from "./ResultStatusControls";
import { DemoSurface } from "./shell/DemoSurface";

/** 정적 표면은 서버에서 조립하고 샘플 응답과 예약 조작은 클라이언트가 맡는다. */
export function ResultStatusDemo() {
  const project = PROJECTS.find(({ slug }) => slug === "syu-likelion")!;
  return (
    <DemoSurface
      hue={project.hue ?? "mocha"}
      caption="제출 완료 화면은 수정이 불가능해지는 시점을 알리고, 서류 합격 화면은 예약 가능한 날짜와 시간을 같은 자리에서 고르게 합니다."
    >
      <ResultStatusControls />
    </DemoSurface>
  );
}
