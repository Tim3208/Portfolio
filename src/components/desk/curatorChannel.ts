/**
 * 연출 커서(큐레이터)에게 말을 시키는 창구.
 *
 * 큐레이터는 레이아웃에 하나만 있고(Curator.tsx), 어느 클라이언트 컴포넌트든
 * 부가 설명이 필요한 자리에서 `curator.say({ text, target })` 를 부르면 커서가
 * 그 요소 곁으로 다가와 말을 타이핑하고 제자리로 돌아간다. 요청은 차례로 처리하고,
 * 큐레이터가 없는 화면(lg 미만)에서는 아무것도 하지 않는다.
 */
export type SayRequest = {
  text: string;
  /** 다가갈 요소. 없으면 지금 자리에서 말한다. */
  target?: Element | null;
  /** 다 쓴 말을 보여주는 시간(ms). 방문자가 스크롤하면 일찍 끝난다. */
  hold?: number;
};

type Handler = (request: SayRequest) => Promise<void>;

let handler: Handler | null = null;

export const curator = {
  say(request: SayRequest): Promise<void> {
    return handler ? handler(request) : Promise.resolve();
  },
};

export function registerCurator(next: Handler) {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}
