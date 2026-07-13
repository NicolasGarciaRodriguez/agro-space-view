"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordResetRepository } from "@agrospace/shared/repositories/PasswordReset.repository";
import {
  PASSWORD_RULES,
  isPasswordValid,
} from "@agrospace/shared/config/PasswordRules.config";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import styles from "./ResetPassword.module.scss";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Enlace de restablecimiento no válido.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Enlace de restablecimiento no válido.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!isPasswordValid(password)) {
      setError("La contraseña no cumple los requisitos mínimos");
      return;
    }

    setIsLoading(true);

    try {
      await PasswordResetRepository.confirmReset({ token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "No se pudo restablecer la contraseña.")
          : "No se pudo restablecer la contraseña.",
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
          <h1 className={styles.card__title}>Nueva contraseña</h1>
          <p className={styles.card__subtitle}>
            Elige una contraseña segura para tu cuenta
          </p>
        </header>

        {success ? (
          <div className={styles.sentMessage}>
            <span className={styles.sentMessage__icon}>✓</span>
            <p>Tu contraseña se ha actualizado correctamente.</p>
            <Button fullWidth size="lg" onClick={() => router.push("/login")}>
              Ir a iniciar sesión
            </Button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div>
              <Input
                id="password"
                type="password"
                label="Nueva contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                disabled={isLoading || !token}
                autoComplete="new-password"
                required
              />
              {(passwordFocused || password.length > 0) && (
                <ul className={styles.form__passwordRules}>
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(password);
                    return (
                      <li
                        key={rule.id}
                        className={[
                          styles.form__passwordRule,
                          met ? styles["form__passwordRule--met"] : "",
                        ].join(" ")}
                      >
                        {met ? "✓" : "○"} {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Input
              id="confirmPassword"
              type="password"
              label="Confirmar contraseña"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || !token}
              autoComplete="new-password"
              required
            />

            {error && (
              <p className={styles.form__error} role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              size="lg"
              disabled={!token}
            >
              Restablecer contraseña
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