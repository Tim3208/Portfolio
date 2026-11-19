import type { ReactNode } from "react";

import styles from "./DemoShell.module.css";

/** 화면과 패널을 md 이상에서 나란히 놓는다. 화면의 폭은 데모가 정한다. */
export function DemoLayout({ children }: { children: ReactNode }) {
  return <div className={styles.layout}>{children}</div>;
}
