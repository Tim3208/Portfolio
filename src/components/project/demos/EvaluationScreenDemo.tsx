import { PROJECTS } from "@/data/projects";

import { EvaluationScreenControls } from "./EvaluationScreenControls";
import { DemoSurface } from "./shell/DemoSurface";

/** 공동 작성한 서비스 화면임을 표면에서 밝히고, 가상 응답과 조작은 클라이언트에 둔다. */
export function EvaluationScreenDemo() {
  const project = PROJECTS.find(({ slug }) => slug === "syu-likelion")!;
  return (
    <DemoSurface
      hue={project.hue ?? "mocha"}
      label="실제 서비스 코드 · 팀원과 공동 작성 · 가상 지원자"
      caption="지원서 상세와 서류 지원자 표는 팀원이 먼저 만들었고, 단계별 목록 분리와 면접 단계의 이름 표시, 면접 대상자 표를 맡았습니다. 같은 지원자 안에서 서류 · 채점 · 점수 현황을 오갈 수 있습니다."
    >
      <EvaluationScreenControls />
    </DemoSurface>
  );
}
