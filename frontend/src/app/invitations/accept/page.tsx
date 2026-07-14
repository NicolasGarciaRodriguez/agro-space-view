"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ExplotacionInvitationRepository } from "@agrospace/shared/repositories/ExplotacionInvitation.repository";
import { useAuthStore } from "@/stores/auth/Auth.store";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type { InvitationDetailDTO } from "@agrospace/shared/dtos/ExplotacionInvitation.dto";
import styles from "./AcceptInvitation.module.scss";

type Status = "loading" | "ready" | "accepting" | "accepted" | "error";

const NIVEL_LABELS: Record<NivelAcceso, string> = {
  [NivelAcceso.CONSULTA]: "Consulta (solo ver)",
  [NivelAcceso.GESTION]: "Gestión (ver y editar)",
};

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  const [status, setStatus] = useState<Status>("loading");
  const [invitation, setInvitation] = useState<InvitationDetailDTO | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Enlace de invitación no válido.");
      return;
    }

    ExplotacionInvitationRepository.getByToken(token)
      .then((data) => {
        setInvitation(data);
        setStatus("ready");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          isHttpError(err)
            ? (err.message ?? "No se pudo cargar la invitación.")
            : "No se pudo cargar la invitación.",
        );
      });
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setStatus("accepting");
    setErrorMessage(null);

    try {
      await ExplotacionInvitationRepository.accept(token);
      setStatus("accepted");
    } catch (err) {
      setStatus("ready");
      setErrorMessage(
        isHttpError(err)
          ? (err.message ?? "No se pudo aceptar la invitación.")
          : "No se pudo aceptar la invitación.",
      );
    }
  };

  const emailMismatch =
    isAuthenticated &&
    currentUser &&
    invitation &&
    currentUser.email.toLowerCase() !== invitation.email.toLowerCase();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {status === "loading" && (
          <>
            <span className={styles.card__spinner} />
            <h1 className={styles.card__title}>Cargando invitación…</h1>
          </>
        )}

        {status === "error" && (
          <>
            <span className={styles.card__icon} data-error>
              ✕
            </span>
            <h1 className={styles.card__title}>No se pudo cargar</h1>
            <p className={styles.card__text}>{errorMessage}</p>
            <Link href="/login" className={styles.card__link}>
              Ir al login
            </Link>
          </>
        )}

        {status === "accepted" && (
          <>
            <span className={styles.card__icon}>✓</span>
            <h1 className={styles.card__title}>¡Invitación aceptada!</h1>
            <p className={styles.card__text}>
              Ya tienes acceso a las explotaciones compartidas. Puedes
              seleccionarlas desde el menú lateral del dashboard.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Ir al dashboard
            </Button>
          </>
        )}

        {(status === "ready" || status === "accepting") && invitation && (
          <>
            <span className={styles.card__icon}>🤝</span>
            <h1 className={styles.card__title}>Te han invitado a colaborar</h1>
            <p className={styles.card__text}>
              <strong>{invitation.invitadoPorNombre}</strong> te invita a
              colaborar con nivel{" "}
              <strong>{NIVEL_LABELS[invitation.nivelAcceso]}</strong> en:
            </p>

            <ul className={styles.card__list}>
              {invitation.explotaciones.map((ex) => (
                <li key={ex.id}>{ex.nombre}</li>
              ))}
            </ul>

            {!isAuthenticated && (
              <>
                <p className={styles.card__hint}>
                  Necesitas iniciar sesión o crear una cuenta con el email{" "}
                  <strong>{invitation.email}</strong> para aceptar.
                </p>
                <div className={styles.card__actions}>
                  <Link
                    href={`/login?redirect=/invitations/accept?token=${token}`}
                    className={styles.card__button}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href={`/register?redirect=/invitations/accept?token=${token}`}
                    className={styles.card__buttonSecondary}
                  >
                    Crear cuenta
                  </Link>
                </div>
              </>
            )}

            {isAuthenticated && emailMismatch && (
              <p className={styles.card__error}>
                Esta invitación fue enviada a {invitation.email}, pero has
                iniciado sesión con {currentUser?.email}. Cierra sesión e
                inicia con el email correcto para aceptarla.
              </p>
            )}

            {isAuthenticated && !emailMismatch && (
              <>
                {errorMessage && (
                  <p className={styles.card__error}>{errorMessage}</p>
                )}
                <Button
                  onClick={handleAccept}
                  loading={status === "accepting"}
                >
                  Aceptar invitación
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}