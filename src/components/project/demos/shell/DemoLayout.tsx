import type { ReactNode } from "react";

import styles from "./DemoShell.module.css";

/** 기본은 화면·패널 2열, wide는 패널 위에 고정 설계 폭의 화면을 놓는다. */
export function DemoLayout({ children, variant }: { children: ReactNode; variant?: "wide" }) {
  return (
    <div data-demo-layout={variant} className={`${styles.layout}${variant === "wide" ? ` ${styles.wideLayout}` : ""}`}>
      {children}
    </div>
  );
}
