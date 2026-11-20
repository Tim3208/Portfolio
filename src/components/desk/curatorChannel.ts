import type { CuratorCue } from "@/data/curator";

/**
 * 연출 커서(큐레이터)에게 맞장구를 시키는 창구.
 *
 * 큐레이터는 레이아웃에 하나만 있고(Curator.tsx), 어느 클라이언트 컴포넌트든
 * 방문자가 무언가를 한 순간에 `curator.react(cue, target)` 을 부르면 커서가
 * 그 요소 곁으로 다가와 한마디 하고 제자리로 돌아간다. 대사는
 * src/data/curator.ts 의 `reactions` 에 있다.
 *
 * 같은 말은 한 번 들어온 동안 한 번만 하고, 다른 말을 하는 중이면 넘어간다.
 * 큐레이터가 없는 화면(lg 미만)에서는 아무것도 하지 않는다.
 */
type Handler = (cue: CuratorCue, target?: Element | null) => void;

let handler: Handler | null = null;

export const curator = {
  /** target 은 다가갈 요소. 없으면 쉬던 자리에서 말한다. */
  react(cue: CuratorCue, target?: Element | null) {
    handler?.(cue, target);
  },
};

export function registerCurator(next: Handler) {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}
