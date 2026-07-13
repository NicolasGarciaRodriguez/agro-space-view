"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthRepository } from "@agrospace/shared/repositories/Auth.repository";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import styles from "./LoginForm.module.scss";
import { useAuthStore } from "@/stores/auth/Auth.store";

export const LoginForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await AuthRepository.login({ email, password });
      setAuth(res.token, res.user);
      router.push("/dashboard");
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al iniciar sesión.")
          : "Error al iniciar sesión.",
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
          <h1 className={styles.card__title}>AgroSpaceView</h1>
          <p className={styles.card__subtitle}>
            Accede a tu cuenta para monitorear tus parcelas
          </p>
        </header>

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

          <div className={styles.form__passwordField}>
            <Input
              id="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
            <Link href="/forgot-password" className={styles.form__forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <p className={styles.form__error} role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={isLoading} size="lg">
            Iniciar sesión
          </Button>
        </form>

        <footer className={styles.card__footer}>
          <p>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className={styles.card__link}>
              Regístrate
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};