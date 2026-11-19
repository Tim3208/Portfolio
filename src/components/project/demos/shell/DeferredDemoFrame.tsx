"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import styles from "./DemoShell.module.css";

/** 빈 자리의 크기와 마크업은 데모가 넘기고, 가까이 온 화면만 한 번 마운트한다. */
export function DeferredDemoFrame({
  className,
  placeholder,
  children,
}: {
  className: string;
  placeholder: ReactNode;
  children: ReactNode;
}) {
  const [nearby, setNearby] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={frameRef} className={`${styles.frame} ${className}`}>
      {nearby ? children : placeholder}
    </div>
  );
}
