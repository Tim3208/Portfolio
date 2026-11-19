/**
 * 원본: src/shared/ui/Panel.tsx · 기준 커밋: 40c516b.
 * 변경: 원본 타입·표시 계약·순수 로직을 수정 없이 옮겼다.
 */
import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div";
  children: ReactNode;
};

/**
 * 대시보드의 반복 패널 스타일을 공유하는 얇은 래퍼다.
 *
 * 의미가 필요한 영역은 기본 `section`을 쓰고, 단순 묶음은 `as="div"`로 바꿀 수 있다.
 */
export function Panel({
  as: Component = "section",
  children,
  className,
  ...props
}: PanelProps) {
  return (
    <Component
      className={[
        "min-w-0 max-w-full rounded-lg border border-[#2b2b2b] bg-[#1f1f1f] shadow-[inset_0_1px_0_rgb(255_255_255/3%)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}
