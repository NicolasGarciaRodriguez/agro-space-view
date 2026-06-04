import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "../sidebar/Sidebar.config";
import styles from "./Topbar.module.scss";
import { TopBarProps } from "./Topbar.interface";

export const TopBar = ({ onMenuOpen }: TopBarProps) => {
  const pathname = usePathname();

  const currentItem = NAV_ITEMS.find((item) =>
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href),
  );

  return (
    <header className={styles.topbar}>
      <button
        className={styles.topbar__menu}
        onClick={onMenuOpen}
        aria-label="Abrir menú"
      >
        ☰
      </button>
      <div className={styles.topbar__title}>
        {currentItem && (
          <>
            <span>{currentItem.icon}</span>
            <span>{currentItem.label}</span>
          </>
        )}
      </div>
      <span className={styles.topbar__logo}>🛰</span>
    </header>
  );
};
