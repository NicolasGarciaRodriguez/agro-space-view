"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth/Auth.store";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { PLAN_LIMITS } from "@agrospace/shared/config/PlanLimits.config";
import { InviteCollaboratorModal } from "@/components/inviteCollaboratorModal/InviteCollaboratorModal.component";
import { AddExplotacionModal } from "@/components/addExplotacionModal/AddExplotacionModal.component";
import { DeleteExplotacionModal } from "@/components/deleteExplotacionModal/DeleteExplotacionModal.component";
import { isOwner } from "@/lib/access";
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
  const user = useAuthStore((s) => s.user);
  const {
    activeExplotacion,
    explotaciones,
    setActiveExplotacion,
    addExplotacion,
    removeExplotacion,
  } = useExplotacionStore();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addExplotacionOpen, setAddExplotacionOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const canInvite =
    user?.plan === UserPlan.TECNICO || user?.role === UserRole.ADMIN;

  const puedeEliminar = isOwner(activeExplotacion?.nivelAcceso);

  // Solo cuenta explotaciones propias contra el límite del plan — las
  // compartidas por un colaborador no ocupan cupo del usuario actual.
  const explotacionesPropias = explotaciones.filter(
    (ex) => ex.userId === user?.id,
  ).length;
  const explotacionesMaximas = user
    ? PLAN_LIMITS[user.plan].explotacionesMaximas
    : null;
  const puedeCrearExplotacion =
    user?.role === UserRole.ADMIN ||
    explotacionesMaximas === null ||
    explotacionesPropias < explotacionesMaximas;

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
          {puedeCrearExplotacion && (
            <button
              className={styles.selector__addButton}
              onClick={() => setAddExplotacionOpen(true)}
            >
              + Nueva explotación
            </button>
          )}
          {activeExplotacion && puedeEliminar && (
            <button
              className={styles.selector__deleteButton}
              onClick={() => setDeleteModalOpen(true)}
            >
              🗑 Eliminar esta explotación
            </button>
          )}
        </div>

        {canInvite && (
          <button
            className={styles.sidebar__invite}
            onClick={() => setInviteModalOpen(true)}
          >
            <span>👥</span>
            <span>Invitar colaborador</span>
          </button>
        )}

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

      {inviteModalOpen && (
        <InviteCollaboratorModal
          explotaciones={explotaciones}
          onClose={() => setInviteModalOpen(false)}
          onInvited={() => setInviteModalOpen(false)}
        />
      )}

      {addExplotacionOpen && (
        <AddExplotacionModal
          onCreated={(nueva) => {
            addExplotacion(nueva);
            setAddExplotacionOpen(false);
          }}
          onClose={() => setAddExplotacionOpen(false)}
        />
      )}

      {deleteModalOpen && activeExplotacion && (
        <DeleteExplotacionModal
          explotacionId={activeExplotacion._id}
          explotacionNombre={activeExplotacion.nombre}
          onDeleted={() => {
            removeExplotacion(activeExplotacion._id);
            setDeleteModalOpen(false);
          }}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </>
  );
};