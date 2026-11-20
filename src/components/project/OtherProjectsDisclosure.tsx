"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 기타 프로젝트 접이식 영역.
 * 기본은 접어 두되, /work#others 로 직접 들어온 경우에는 바로 펼쳐 보여준다.
 */
export function OtherProjectsDisclosure({ count, children }: { count: number; children: ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const open = () => {
      if (detailsRef.current) detailsRef.current.open = true;
    };
    const onHash = () => {
      if (window.location.hash === "#others") open();
    };
    const onJump = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('a[href="#others"]')) open();
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onJump);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onJump);
    };
  }, []);

  return (
    <details ref={detailsRef} className="group">
      <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <span className="underline decoration-rule-strong underline-offset-4 group-open:hidden">
          기타 프로젝트 펼쳐보기
        </span>
        <span className="hidden underline decoration-rule-strong underline-offset-4 group-open:inline">
          기타 프로젝트 접기
        </span>
        <span className="rounded-chip bg-paper-sunk px-1.5 font-mono text-xs text-ink-2">{count}</span>
      </summary>
      {children}
    </details>
  );
}
