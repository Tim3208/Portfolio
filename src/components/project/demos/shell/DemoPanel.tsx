import type { ReactNode } from "react";

import styles from "./DemoShell.module.css";

/** 안내·조작·응답의 자리만 제공한다. response에는 summary와 응답 본문을 넣는다. */
export function DemoPanel({
  label,
  intro,
  controls,
  response,
}: {
  label: string;
  intro: ReactNode;
  controls: ReactNode;
  response: ReactNode;
}) {
  return (
    <aside aria-label={label} className={styles.panel}>
      <div className={styles.panelIntro}>{intro}</div>
      <div className={styles.controls}>{controls}</div>
      <details className={`${styles.response} min-w-0 border-t border-rule`}>
        {response}
      </details>
    </aside>
  );
}
