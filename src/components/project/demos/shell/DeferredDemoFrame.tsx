"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import styles from "./DemoShell.module.css";

type FrameProps = {
  className: string;
  placeholder: ReactNode;
  children: ReactNode;
} & ({
  variant?: undefined;
  designWidth?: never;
  resetKey?: never;
  label?: never;
} | {
  variant: "wide";
  designWidth: number;
  resetKey: string | number;
  label: string;
});

/** 모바일 문서와 md의 창 안 스크롤 모두에서, 가려진 프레임 위쪽만 다시 보여 준다. */
function revealFrameTop(frame: HTMLElement) {
  let parent = frame.parentElement;
  while (parent && parent !== document.body) {
    if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) {
      const visibleTop = Math.max(0, parent.getBoundingClientRect().top);
      const offset = frame.getBoundingClientRect().top - visibleTop;
      if (offset < 0) parent.scrollTo({ top: parent.scrollTop + offset, behavior: "instant" });
      return;
    }
    parent = parent.parentElement;
  }
  const offset = frame.getBoundingClientRect().top;
  if (offset < 0) window.scrollTo({ top: window.scrollY + offset, behavior: "instant" });
}

/** 빈 자리는 데모가 넘긴다. wide는 설계 폭·실측 패널 높이로 크기만 조절한다. */
export function DeferredDemoFrame({
  className,
  placeholder,
  children,
  variant,
  designWidth,
  resetKey,
  label,
}: FrameProps) {
  const [nearby, setNearby] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const previousReset = useRef(resetKey);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (!("IntersectionObserver" in window)) {
      // 외부 API 구독의 초기 결과와 같은 즉시 표시 fallback.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNearby(true);
      return;
    }
    // root=null은 문서와 중간 스크롤 조상(Viewport)의 교차 영역을 함께 확인한다.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNearby(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px 0px" });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || variant !== "wide") return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    const panel = frame.closest('[data-demo-layout="wide"]')?.querySelector<HTMLElement>("[data-demo-panel]");
    frame.style.setProperty("--demo-design-width", `${designWidth}px`);

    const measure = () => {
      const scale = desktop.matches ? Math.min(1, frame.clientWidth / designWidth) : 1;
      // zoom은 축소된 높이까지 레이아웃에 반영하며 원본 lg 분기는 브라우저 폭을 따른다.
      frame.style.setProperty("--demo-scale", String(scale));
      frame.style.setProperty("--demo-panel-height", `${panel?.getBoundingClientRect().height ?? 0}px`);
      frame.tabIndex = desktop.matches ? 0 : -1;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    if (panel) observer.observe(panel);
    desktop.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", measure);
    };
  }, [variant, designWidth]);

  useEffect(() => {
    if (variant !== "wide" || previousReset.current === resetKey) return;
    previousReset.current = resetKey;
    const frame = frameRef.current;
    if (!frame) return;
    if (window.matchMedia("(min-width: 64rem)").matches) {
      frame.scrollTo({ top: 0, behavior: "instant" });
    } else {
      revealFrameTop(frame);
    }
  }, [variant, resetKey]);

  return (
    <div
      ref={frameRef}
      className={`${styles.frame} ${className}${variant === "wide" ? ` ${styles.wideFrame}` : ""}`}
      role={variant === "wide" ? "region" : undefined}
      aria-label={label}
      tabIndex={variant === "wide" ? -1 : undefined}
    >
      {variant === "wide" ? (
        <div className={styles.wideContent}>{nearby ? children : placeholder}</div>
      ) : nearby ? children : placeholder}
    </div>
  );
}
