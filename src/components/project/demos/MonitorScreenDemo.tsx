import { PROJECTS } from "@/data/projects";

import { MonitorScreenControls } from "./MonitorScreenControls";
import { DemoSurface } from "./shell/DemoSurface";

/** AgentFlow Monitor 실제 코드 실행 데모. 출처와 설명은 서버 표면, 탐색과 시나리오 전환은 클라이언트가 맡는다. */
export function MonitorScreenDemo() {
  const project = PROJECTS.find(({ slug }) => slug === "agentflow")!;
  return (
    <DemoSurface
      hue={project.hue ?? "wheat"}
      label="실제 모니터링 앱 코드 · 샘플 실행 데이터"
      caption="AgentFlow Monitor의 실제 화면을 샘플 실행 기록으로 옮겼습니다. 상단의 지금 줄로 현재 상태를 고정해 두고, 흐름 · 단계 · 작업 · 회차를 한 깊이씩 내려가며 QA 반려 사유와 원문 기록을 확인합니다."
    >
      <MonitorScreenControls />
    </DemoSurface>
  );
}
