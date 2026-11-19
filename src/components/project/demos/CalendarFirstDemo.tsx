import { PROJECTS } from "@/data/projects";

import { CalendarFirstControls } from "./CalendarFirstControls";
import { DemoSurface } from "./shell/DemoSurface";

/** 바꾸기 전 원본의 출처와 설명은 서버 표면, 날짜와 서비스 조작은 클라이언트가 맡는다. */
export function CalendarFirstDemo() {
  const project = PROJECTS.find(({ slug }) => slug === "oshi-calendar")!;
  return (
    <DemoSurface
      hue={project.hue ?? "plum"}
      label="바꾸기 전 화면의 실제 코드 · 샘플 일정"
      caption="2026년 8월 3일에 바꾸기 직전의 첫 화면입니다. 일정을 날짜 칸에 놓으면 무엇이 먼저 끝나는지 한눈에 들어오지 않아, 가운데 자리를 보상과 오늘 할 일로 바꿨습니다."
    >
      <CalendarFirstControls />
    </DemoSurface>
  );
}
