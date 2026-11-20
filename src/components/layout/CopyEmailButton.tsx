"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Contact 이메일 원클릭 복사 버튼.
 * mailto: 링크만 있으면 데스크톱에서 원치 않는 메일 앱이 열리는 불편이 있어,
 * 주소를 바로 클립보드에 복사하는 길을 나란히 둔다.
 */
export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-chip border border-deep-ink-2/50 px-3 text-sm text-deep-ink-2 transition-colors duration-150 hover:border-deep-ink hover:text-deep-ink"
    >
      {copied ? "복사됨" : "이메일 복사"}
    </button>
  );
}
