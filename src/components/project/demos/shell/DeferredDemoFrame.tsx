"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

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
  scaleAtAllWidths?: never;
  designHeight?: never;
  scaleFrom?: never;
} | {
  variant: "wide";
  designWidth: number;
  resetKey: string | number;
  label: string;
} & ({
  scaleAtAllWidths?: false;
  designHeight?: never;
  scaleFrom?: "lg" | "xl";
} | {
  scaleAtAllWidths: true;
  designHeight: number;
  scaleFrom?: never;
}));

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

/**
 * wide의 기본은 모바일 원본, 선택적으로 모든 폭에서 고정 캔버스 전체를 축소한다.
 *
 * 안에서 스크롤되는 wide 프레임은 창 안 본문 스크롤과 겹친다. 마우스로 페이지를
 * 내리다가 프레임이 커서 밑으로 들어온 것만으로는 휠을 가로채지 않고(data-guard),
 * 커서를 프레임 안에서 실제로 움직이거나 누르면 프레임이 휠과 클릭을 받는다
 * (data-engaged). 그동안 표면 바깥을 어둡게 해 지금 데모 안을 조작 중임을 알린다
 * (DemoShell.module.css). 터치와 키보드에는 적용하지 않는다.
 */
export function DeferredDemoFrame({
  className,
  placeholder,
  children,
  variant,
  designWidth,
  resetKey,
  label,
  scaleAtAllWidths,
  designHeight,
  scaleFrom = "lg",
}: FrameProps) {
  const [nearby, setNearby] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const heightBudgetRef = useRef<HTMLDivElement>(null);
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
    const desktop = window.matchMedia(scaleFrom === "xl" ? "(min-width: 80rem)" : "(min-width: 64rem)");
    const panel = frame.closest('[data-demo-layout="wide"]')?.querySelector<HTMLElement>("[data-demo-panel]");
    frame.style.setProperty("--demo-design-width", `${designWidth}px`);

    const measure = () => {
      const panelHeight = panel?.getBoundingClientRect().height ?? 0;
      frame.style.setProperty("--demo-panel-height", `${panelHeight}px`);
      const widthScale = Math.min(1, frame.clientWidth / designWidth);
      const heightScale = scaleAtAllWidths && desktop.matches && designHeight
        ? (heightBudgetRef.current?.getBoundingClientRect().height ?? designHeight) / designHeight
        : 1;
      const scale = scaleAtAllWidths ? Math.min(widthScale, heightScale) : desktop.matches ? widthScale : 1;
      // 원본의 데스크톱 분기와 같은 폭에서만 축소한다. 기존 데모의 기본값은 lg다.
      frame.style.setProperty("--demo-scale", String(scale));
      frame.tabIndex = !scaleAtAllWidths && desktop.matches ? 0 : -1;
      if (contentRef.current && scaleAtAllWidths) contentRef.current.inert = !desktop.matches;
    };
    measure();
    // 측정으로 zoom과 프레임 높이가 바뀌어도 같은 ResizeObserver 회차에서 되먹임하지 않는다.
    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measure);
    });
    observer.observe(frame);
    if (panel) observer.observe(panel);
    if (heightBudgetRef.current) observer.observe(heightBudgetRef.current);
    desktop.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      desktop.removeEventListener("change", measure);
    };
  }, [variant, designWidth, scaleAtAllWidths, designHeight, scaleFrom]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || variant !== "wide") return;
    const desktop = window.matchMedia(scaleFrom === "xl" ? "(min-width: 80rem)" : "(min-width: 64rem)");
    const release = () => {
      delete frame.dataset.guard;
      delete frame.dataset.engaged;
    };
    const engage = () => {
      delete frame.dataset.guard;
      frame.dataset.engaged = "";
    };
    const usesMouse = (event: PointerEvent) => event.pointerType === "mouse" && desktop.matches;
    const onEnter = (event: PointerEvent) => {
      if (usesMouse(event) && !("engaged" in frame.dataset)) frame.dataset.guard = "";
    };
    const onMove = (event: PointerEvent) => {
      // 스크롤로 화면이 커서 밑에 들어왔을 때 브라우저가 만드는 이동에는 움직인 거리가 없다.
      if (usesMouse(event) && (event.movementX !== 0 || event.movementY !== 0)) engage();
    };
    const onDown = (event: PointerEvent) => {
      if (usesMouse(event)) engage();
    };
    frame.addEventListener("pointerenter", onEnter);
    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerdown", onDown);
    frame.addEventListener("pointerleave", release);
    desktop.addEventListener("change", release);
    return () => {
      frame.removeEventListener("pointerenter", onEnter);
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerdown", onDown);
      frame.removeEventListener("pointerleave", release);
      desktop.removeEventListener("change", release);
      release();
    };
  }, [variant, scaleFrom]);

  useEffect(() => {
    if (variant !== "wide" || previousReset.current === resetKey) return;
    previousReset.current = resetKey;
    const frame = frameRef.current;
    if (!frame) return;
    if (window.matchMedia(scaleFrom === "xl" ? "(min-width: 80rem)" : "(min-width: 64rem)").matches) {
      if (scaleAtAllWidths) return;
      frame.scrollTo({ top: 0, behavior: "instant" });
    } else {
      revealFrameTop(frame);
    }
  }, [variant, resetKey, scaleAtAllWidths, scaleFrom]);

  return (
    <div
      ref={frameRef}
      className={`${styles.frame} ${className}${variant === "wide" ? ` ${styles.wideFrame}` : ""}${scaleFrom === "xl" ? ` ${styles.xlFrame}` : ""}${scaleAtAllWidths ? ` ${styles.allWidthsFrame}` : ""}`}
      style={variant === "wide" ? { "--demo-design-width": `${designWidth}px` } as CSSProperties : undefined}
      role={variant === "wide" ? "region" : undefined}
      aria-label={label}
      tabIndex={variant === "wide" ? -1 : undefined}
    >
      {scaleAtAllWidths ? <div ref={heightBudgetRef} className={styles.heightBudget} aria-hidden="true" /> : null}
      {variant === "wide" ? (
        <div ref={contentRef} className={styles.wideContent} inert={scaleAtAllWidths || undefined}>{nearby ? children : placeholder}</div>
      ) : nearby ? children : placeholder}
    </div>
  );
}
