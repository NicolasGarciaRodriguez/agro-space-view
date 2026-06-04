import type { ReactNode } from "react";
import styles from "./layout.module.scss";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <div className={`${styles.page} dark`}>{children}</div>;
}
