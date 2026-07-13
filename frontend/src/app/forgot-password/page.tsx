"use client";

import { useState } from "react";
import Link from "next/link";
import { PasswordResetRepository } from "@agrospace/shared/repositories/PasswordReset.repository";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import styles from "./ForgotPassword.module.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await PasswordResetRepository.requestReset({ email });
      setSent(true);
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al procesar la solicitud.")
          : "Error al procesar la solicitud.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.card__header}>
          <div className={styles.card__logo}>
            <span className={styles.card__logo__icon}>🛰</span>
          </div>
          <h1 className={styles.card__title}>Recuperar contraseña</h1>
          <p className={styles.card__subtitle}>
            Te enviaremos un enlace para restablecerla
          </p>
        </header>

        {sent ? (
          <div className={styles.sentMessage}>
            <span className={styles.sentMessage__icon}>✓</span>
            <p>
              Si el email <strong>{email}</strong> está registrado, recibirás
              un enlace para restablecer tu contraseña en unos minutos.
            </p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              required
            />

            {error && (
              <p className={styles.form__error} role="alert">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth loading={isLoading} size="lg">
              Enviar enlace
            </Button>
          </form>
        )}

        <footer className={styles.card__footer}>
          <Link href="/login" className={styles.card__link}>
            ← Volver al login
          </Link>
        </footer>
      </div>
    </div>
  );
}