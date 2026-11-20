"use client";

import { useEffect, useState } from "react";

type TocItem = {
  num: string;
  title: string;
};

/** 데스크톱 Viewport 또는 모바일 문서 중 실제 스크롤 주체를 찾는다. */
function findScrollParent(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return null;
}

/**
 * Case Study 왼쪽 고정 목차 (xl 이상).
 * 화면 중상단(보이는 영역 위에서 약 38% 지점)을 지나는 마지막 섹션을 현재 위치로 잡는다.
 * 짧은 섹션이 이어질 때도 시선이 다음 섹션에 닿으면 바로 전환된다.
 */
export function CaseToc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState(items[0]?.num ?? "");

  useEffect(() => {
    const targets = items
      .map((item) => ({ num: item.num, el: document.getElementById(`section-${item.num}`) }))
      .filter((entry): entry is { num: string; el: HTMLElement } => entry.el !== null);

    if (!targets.length) return;

    const scroller = findScrollParent(targets[0].el);
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = scroller?.getBoundingClientRect();
      const top = rect ? rect.top : 0;
      const height = rect ? rect.height : window.innerHeight;
      const readingLine = top + height * 0.38;

      // 맨 아래까지 내렸을 때는 마지막 짧은 섹션도 활성화한다
      const atBottom = scroller
        ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4
        : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;

      if (atBottom) {
        setActive(targets[targets.length - 1].num);
        return;
      }

      let current = targets[0].num;
      for (const target of targets) {
        if (target.el.getBoundingClientRect().top <= readingLine) {
          current = target.num;
        } else {
          break;
        }
      }
      setActive(current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    const scrollTarget = scroller ?? window;
    scrollTarget.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      scrollTarget.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items]);

  return (
    <nav aria-label="목차" className="hidden xl:block">
      <ol className="sticky top-6 flex flex-col border-l border-rule">
        {items.map((s) => {
          const isCurrent = active === s.num;
          return (
            <li key={s.num}>
              <a
                href={`#section-${s.num}`}
                aria-current={isCurrent ? "location" : undefined}
                onClick={() => setActive(s.num)}
                className={`-ml-px flex min-h-9 items-center border-l-2 py-1 pl-3 text-sm leading-snug transition-colors duration-150 ${
                  isCurrent
                    ? "border-hue-deep font-semibold text-ink"
                    : "border-transparent text-ink-2 hover:border-hue-deep hover:text-ink"
                }`}
              >
                {s.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
