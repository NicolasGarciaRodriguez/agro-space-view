"use client";

import { useState } from "react";
import { EmailVerificationRepository } from "@agrospace/shared/repositories/EmailVerification.repository";
import { useAuthStore } from "@/stores/auth/Auth.store";
import { useEmailBlockStore } from "@/stores/emailBlock/EmailBlock.store";
import { isHttpError } from "@/lib/http-error";
import styles from "./EmailBlockScreen.module.scss";

export const EmailBlockScreen = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setError(null);
    setIsSending(true);
    try {
      await EmailVerificationRepository.resend();
      setSent(true);
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "No se pudo reenviar el email.")
          : "No se pudo reenviar el email.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <span className={styles.card__icon}>🔒</span>
        <h1 className={styles.card__title}>Verifica tu email para continuar</h1>
        <p className={styles.card__text}>
          Ha pasado el plazo para verificar tu cuenta. Reenvía el email de
          verificación y haz clic en el enlace para recuperar el acceso.
        </p>

        {error && <p className={styles.card__error}>{error}</p>}
        {sent && (
          <p className={styles.card__sent}>
            Email reenviado — revisa tu bandeja de entrada.
          </p>
        )}

        <div className={styles.card__actions}>
          <button
            className={styles.card__button}
            onClick={handleResend}
            disabled={isSending || sent}
          >
            {isSending ? "Enviando…" : sent ? "Reenviado" : "Reenviar email"}
          </button>
          <button className={styles.card__logout} onClick={clearAuth}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};