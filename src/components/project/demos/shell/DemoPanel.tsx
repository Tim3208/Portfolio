import type { ReactNode } from "react";

import styles from "./DemoShell.module.css";

/** 안내·조작·일반 본문·선택적 응답의 자리만 제공한다. */
export function DemoPanel({
  label,
  intro,
  controls,
  body,
  response,
}: {
  label: string;
  intro: ReactNode;
  controls: ReactNode;
  body?: ReactNode;
  response?: ReactNode;
}) {
  return (
    <aside data-demo-panel aria-label={label} className={styles.panel}>
      <div className={styles.panelIntro}>{intro}</div>
      <div className={styles.controls}>{controls}</div>
      {body ? <div className="min-w-0">{body}</div> : null}
      {response ? (
        <details className={`${styles.response} min-w-0 border-t border-rule`}>
          {response}
        </details>
      ) : null}
    </aside>
  );
}
