/**
 * 원본: src/features/planned-action/ui/PlannedAction.tsx · 기준 커밋: 40c516b.
 * 변경: 툴팁 폭을 설계 크기 기준 220px로 고정하고 모션 감소를 적용했다.
 */
import type { ReactNode } from "react";

type PlannedActionProps = {
  children: ReactNode;
  message: string;
  compact?: boolean;
};

/**
 * 아직 구현 전인 기능을 클릭 가능한 UI로 남기되, hover/focus에서 안내문을 보여준다.
 *
 * 친구 일정, 게임 추가처럼 계획된 기능의 자리를 디자인에 보존하기 위한 컴포넌트다.
 */
export function PlannedAction({
  children,
  message,
  compact = false,
}: PlannedActionProps) {
  return (
    <div
      className={["group relative", compact ? "inline-flex" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
      <div
        className="pointer-events-none absolute top-[calc(100%+6px)] left-0 z-[5] w-[220px] translate-y-[-4px] rounded-lg border border-[#292929] bg-[#302F2F] p-2.5 text-[12px] text-[#d8d8d8] opacity-0 shadow-[0_16px_42px_rgb(0_0_0/38%)] transition-[opacity,transform] duration-[160ms] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transform-none motion-reduce:transition-none"
        role="status"
      >
        {message}
      </div>
    </div>
  );
}
