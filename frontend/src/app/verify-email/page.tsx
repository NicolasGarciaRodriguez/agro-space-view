"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EmailVerificationRepository } from "@agrospace/shared/repositories/EmailVerification.repository";
import { isHttpError } from "@/lib/http-error";
import styles from "./VerifyEmail.module.scss";
import { getBaseUrl } from "@agrospace/shared/services/Http.service";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Enlace de verificación no válido.");
      return;
    }

    console.log("🔍 getBaseUrl() en la página:", getBaseUrl());

    EmailVerificationRepository.verify({ token })
      .then(() => setStatus("success"))
      .catch((err) => {
        console.log('error', err);
        setStatus("error");
        setErrorMessage(
          isHttpError(err)
            ? (err.message ?? "No se pudo verificar el email.")
            : "No se pudo verificar el email.",
        );
      });
  }, [token]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {status === "loading" && (
          <>
            <span className={styles.card__spinner} />
            <h1 className={styles.card__title}>Verificando tu email…</h1>
          </>
        )}

        {status === "success" && (
          <>
            <span className={styles.card__icon}>✓</span>
            <h1 className={styles.card__title}>¡Email verificado!</h1>
            <p className={styles.card__text}>
              Tu cuenta ya está completamente activa. Ya puedes usar todas las
              funciones de AgroSpaceView.
            </p>
            <button
              className={styles.card__button}
              onClick={() => router.push("/dashboard")}
            >
              Ir al dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <span className={styles.card__icon} data-error>
              ✕
            </span>
            <h1 className={styles.card__title}>No se pudo verificar</h1>
            <p className={styles.card__text}>{errorMessage}</p>
            <p className={styles.card__hint}>
              Si el enlace ha caducado, inicia sesión y pide que te reenvíen
              el email de verificación.
            </p>
            <button
              className={styles.card__button}
              onClick={() => router.push("/login")}
            >
              Ir al login
            </button>
          </>
        )}
      </div>
    </div>
  );
}