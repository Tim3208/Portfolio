/**
 * 원본: eodiya/src/components/_common/Button.tsx
 * 기준 커밋: origin/main 20f029a
 * 변경: brand 색을 범위 변수로 격리하고 outline-none을 Tailwind 4 outline-hidden으로 치환.
 */
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost";
    size?: "sm" | "md";
  }
>;

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition focus:outline-hidden focus:ring-2 focus:ring-(--eodiya-brand-primary)/30 disabled:opacity-50";

  const sizes = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm";

  const variants =
    variant === "primary"
      ? "bg-(--eodiya-brand-primary) text-(--eodiya-brand-on-primary) hover:bg-(--eodiya-brand-primary-hover)"
      : "bg-transparent text-(--eodiya-brand-primary) hover:bg-(--eodiya-brand-primary)/10";

  return (
    <button className={`${base} ${sizes} ${variants} ${className}`} {...rest}>
      {children}
    </button>
  );
}
