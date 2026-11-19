/**
 * 원본: eodiya/src/components/_common/SearchInput.tsx
 * 기준 커밋: origin/main 20f029a
 * 변경: 색을 범위 변수로 격리하고 Tailwind 3 기본 테두리색을 명시.
 * outline-none은 같은 동작의 Tailwind 4 outline-hidden으로 치환.
 */
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function SearchInput({ className = "", ...rest }: Props) {
  return (
    <input
      className={[
        "w-full rounded-xl border border-(--eodiya-gray-200) bg-(--eodiya-white) px-4 py-3 text-sm",
        "outline-hidden transition placeholder:text-(--eodiya-gray-400)",
        "focus:ring-2 focus:ring-(--eodiya-brand-primary)/30",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
