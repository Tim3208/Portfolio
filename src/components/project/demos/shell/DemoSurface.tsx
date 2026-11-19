import type { ReactNode } from "react";

import { HUE_CLASS, type Hue } from "@/lib/hue";

import styles from "./DemoShell.module.css";

/** 실제 코드 실행 데모의 표면. 내용과 캡션은 각 데모에서 채운다. */
export function DemoSurface({
  hue,
  label = "실제 서비스 코드 · 샘플 데이터",
  caption,
  children,
}: {
  hue: Hue;
  label?: ReactNode;
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className={`${HUE_CLASS[hue]} ${styles.surface} flex min-w-0 flex-col gap-4 rounded-xs border border-rule bg-paper-raised p-4 md:p-6`}>
      <p className="text-xs text-ink-2">{label}</p>
      {children}
      <figcaption className="max-w-measure text-ink">{caption}</figcaption>
    </figure>
  );
}
