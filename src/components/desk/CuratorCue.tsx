"use client";

import { useEffect } from "react";

import { curator } from "@/components/desk/curatorChannel";
import type { CuratorCue as Cue } from "@/data/curator";

/**
 * 서버 페이지가 "이 페이지에 들어오면 큐레이터가 한마디 한다"를 적는 자리.
 * 아무것도 그리지 않는다.
 *
 * 첫 로드에서는 본문의 effect 가 큐레이터의 등록보다 먼저 돌기 때문에
 * 다음 프레임에 부른다.
 */
export function CuratorCue({ cue }: { cue: Cue }) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => curator.react(cue));
    return () => cancelAnimationFrame(frame);
  }, [cue]);

  return null;
}
