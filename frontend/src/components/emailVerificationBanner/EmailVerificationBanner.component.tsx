"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth/Auth.store";
import { EmailVerificationRepository } from "@agrospace/shared/repositories/EmailVerification.repository";
import { EmailVerificationStatus } from "@agrospace/shared/enums/EmailVerificationStatus.enum";
import { isHttpError } from "@/lib/http-error";
import styles from "./EmailVerificationBanner.module.scss";

const formatDaysLeft = (deadline: string): number => {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const EmailVerificationBanner = () => {
  const user = useAuthStore((s) => s.user);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;
  if (user.emailVerificationStatus === EmailVerificationStatus.VERIFICADO) {
    return null;
  }

  const daysLeft = formatDaysLeft(user.emailVerificationDeadline);
  if (daysLeft <= 0) return null; // ya bloqueado, lo gestiona otra pantalla

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
    <div className={styles.banner}>
      <div className={styles.banner__content}>
        <span className={styles.banner__icon}>✉️</span>
        <p className={styles.banner__text}>
          Verifica tu email para no perder el acceso. Te quedan{" "}
          <strong>{daysLeft} {daysLeft === 1 ? "día" : "días"}</strong>.
          {sent && (
            <span className={styles.banner__sent}> Email reenviado ✓</span>
          )}
        </p>
      </div>

      <div className={styles.banner__actions}>
        {error && <span className={styles.banner__error}>{error}</span>}
        <button
          className={styles.banner__button}
          onClick={handleResend}
          disabled={isSending || sent}
        >
          {isSending ? "Enviando…" : sent ? "Reenviado" : "Reenviar email"}
        </button>
      </div>
    </div>
  );
};