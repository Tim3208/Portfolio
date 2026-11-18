"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { curator } from "@/components/desk/curatorChannel";
import { CURATOR } from "@/data/curator";

/** 창 연출이 있는 폭(md 이상). 그 아래에서는 실제 서비스를 창 안에 넣지 않는다. */
const WINDOWED = "(min-width: 48rem)";

function subscribe(onChange: () => void) {
  const query = matchMedia(WINDOWED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** 큐레이터의 안내는 한 번 들어온 동안 한 번만 한다 */
let nudged = false;

/**
 * 라이브 탭의 본문 — 실제 서비스를 그대로 연다 (docs/design.md#live).
 *
 * 창이 있는 화면에서만 서비스를 불러온다. 좁은 화면은 창 안의 창이 되어
 * 스크롤이 갇히므로 불러오지 않고, 서버가 넘긴 대체 안내(children)를 보여준다.
 * 불러오는 동안에는 주소와 상태를 보여주고, 다 불러오면 그 위로 서비스가 나타난다.
 *
 * sandbox 는 안의 페이지가 이 창 전체(top)를 다른 곳으로 보내지 못하게 막는다.
 * 그 밖의 동작(스크립트 · 저장소 · 폼 · 새 창 · 내려받기 · 알림창)은 서비스가 쓰는 대로 둔다.
 */
export function LiveFrame({
  src,
  title,
  address,
  children,
}: {
  src: string;
  title: string;
  /** 불러오는 동안 보여줄 주소 (스킴 없이) */
  address: string;
  /** 창이 없는 화면에서 대신 보여줄 안내 */
  children?: ReactNode;
}) {
  const windowed = useSyncExternalStore(
    subscribe,
    () => matchMedia(WINDOWED).matches,
    () => false,
  );
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!windowed || loaded) return;
    const timer = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, [windowed, loaded]);

  function onLoad() {
    setLoaded(true);
    if (nudged) return;
    nudged = true;
    void curator.say({ text: CURATOR.live, target: frameRef.current });
  }

  return (
    <div ref={frameRef} className="relative flex min-h-80 flex-1 flex-col bg-paper-sunk">
      <div
        aria-hidden={loaded || undefined}
        className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <p className="font-mono text-sm break-all text-ink-2">{address}</p>
        {loaded ? null : (
          <p role="status" className="hidden text-ink-2 md:block">
            {slow ? "불러오는 데 시간이 걸리고 있습니다. 새 창에서 열어 볼 수도 있습니다." : "불러오는 중입니다."}
          </p>
        )}
        <div className="flex flex-col items-center gap-4 md:hidden">{children}</div>
      </div>
      {windowed ? (
        <iframe
          src={src}
          title={title}
          onLoad={onLoad}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
          className={`absolute inset-0 size-full border-0 bg-paper-sunk transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
}
