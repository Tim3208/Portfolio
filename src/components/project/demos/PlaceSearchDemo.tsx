import { PROJECTS } from "@/data/projects";

import { PlaceSearchControls } from "./PlaceSearchControls";
import { DemoSurface } from "./shell/DemoSurface";

/** 포트폴리오에서 추가한 서버 표면. 서비스 원본과 설명 패널의 경계를 표시한다. */
export function PlaceSearchDemo() {
  const project = PROJECTS.find(({ slug }) => slug === "eodiya")!;

  return (
    <DemoSurface
      hue={project.hue!}
      label="실제 서비스 코드 · 원본 장소 데이터"
      caption="검색 결과의 순서는 일치한 필드와 일치 정도로 정해집니다. 지도는 빼고 검색 패널만 옮겼습니다."
    >
      <PlaceSearchControls />
    </DemoSurface>
  );
}
