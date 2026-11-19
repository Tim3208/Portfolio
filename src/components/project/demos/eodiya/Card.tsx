/**
 * 원본: eodiya/src/components/_common/Card.tsx
 * 기준 커밋: origin/main 20f029a
 * 변경: 배경·테두리색을 범위 변수로 격리하고 Tailwind 3 shadow-sm을 4의 shadow-xs로 치환.
 */
import type { PropsWithChildren } from "react";

export default function Card({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-2xl border border-(--eodiya-gray-200) bg-(--eodiya-white) p-4 shadow-xs ${className}`}>
      {children}
    </div>
  );
}
