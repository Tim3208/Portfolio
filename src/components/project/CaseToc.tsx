"use client";

import { useEffect, useState } from "react";

type TocItem = {
  num: string;
  title: string;
};

/**
 * Case Study 왼쪽 고정 목차 (xl 이상).
 * 스크롤 위치에 따라 현재 읽고 있는 섹션을 강조한다.
 */
export function CaseToc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState(items[0]?.num ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(`section-${item.num}`))
      .filter((el): el is HTMLElement => el !== null);

    if (!elements.length || typeof IntersectionObserver === "undefined") return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const num = entry.target.id.replace(/^section-/, "");
          if (entry.isIntersecting) visible.add(num);
          else visible.delete(num);
        }
        const first = items.find((item) => visible.has(item.num));
        if (first) setActive(first.num);
      },
      { root: null, rootMargin: "-12% 0px -68% 0px", threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
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
