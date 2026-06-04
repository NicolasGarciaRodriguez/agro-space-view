import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth/Auth.store";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import { NAV_ITEMS } from "./Sidebar.config";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { activeExplotacion, explotaciones, setActiveExplotacion } =
    useExplotacionStore();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={[styles.sidebar, isOpen ? styles["sidebar--open"] : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.sidebar__logo}>
          <span className={styles.sidebar__logo__icon}>🛰</span>
          <span className={styles.sidebar__logo__text}>AgroSpaceView</span>
        </div>

        <div className={styles.selector}>
          <p className={styles.selector__label}>Explotación activa</p>
          <select
            className={styles.selector__select}
            value={activeExplotacion?._id ?? ""}
            onChange={(e) => {
              const found = explotaciones.find(
                (ex) => ex._id === e.target.value,
              );
              if (found) setActiveExplotacion(found);
            }}
          >
            {explotaciones.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.nombre}
              </option>
            ))}
          </select>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  styles.nav__item,
                  isActive ? styles["nav__item--active"] : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={onClose}
              >
                <span className={styles.nav__icon}>{item.icon}</span>
                <span className={styles.nav__label}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebar__footer}>
          <button className={styles.sidebar__logout} onClick={handleLogout}>
            <span>↩</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
