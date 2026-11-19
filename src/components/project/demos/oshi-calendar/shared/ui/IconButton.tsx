/**
 * 원본: src/shared/ui/IconButton.tsx · 기준 커밋: 40c516b.
 * 변경: 흰색·검정색 팔레트를 루트의 --oshi-* 변수로 격리했다.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

/**
 * 아이콘만 보이는 버튼에 접근 가능한 이름과 hover/focus 설명을 함께 제공한다.
 */
export function IconButton({
  children,
  label,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={[
        "group relative inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[#b8b8b8] transition-colors hover:bg-[#2c2c2c] hover:text-[#f5f5f5] focus-visible:border-[#24e6b0] focus-visible:bg-[#2c2c2c] focus-visible:text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24e6b0]/60 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:h-4 [&_svg]:w-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-full z-40 mt-1 hidden whitespace-nowrap rounded-md border border-[#3a3a3a] bg-[#111111] px-2 py-1 text-[11px] font-normal leading-none text-[color:var(--oshi-white)]/78 shadow-[0_10px_30px_rgb(0_0_0/35%)] group-hover:block group-focus-visible:block"
      >
        {label}
      </span>
    </button>
  );
}
