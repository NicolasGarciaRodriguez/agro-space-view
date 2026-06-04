"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthRepository } from "@agrospace/shared/repositories/Auth.repository";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import styles from "./RegisterForm.module.scss";
import { useAuthStore } from "@/stores/auth/Auth.store";

export const RegisterForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellidos: "",
    telefono: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const res = await AuthRepository.register({
        email: form.email,
        password: form.password,
        nombre: form.nombre,
        apellidos: form.apellidos,
        telefono: form.telefono || undefined,
      });
      setAuth(res.token, res.user);
      router.push("/onboarding");
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al registrarse.")
          : "Error al registrarse.",
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
            Crea tu cuenta y empieza a monitorear tus parcelas
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.form__row}>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              label="Nombre"
              placeholder="Juan"
              value={form.nombre}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="given-name"
              required
            />
            <Input
              id="apellidos"
              name="apellidos"
              type="text"
              label="Apellidos"
              placeholder="García López"
              value={form.apellidos}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="family-name"
              required
            />
          </div>

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="email"
            required
          />

          <Input
            id="telefono"
            name="telefono"
            type="tel"
            label="Teléfono (opcional)"
            placeholder="+34 600 000 000"
            value={form.telefono}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="tel"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="new-password"
            required
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="new-password"
            required
          />

          {error && (
            <p className={styles.form__error} role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={isLoading} size="lg">
            Crear cuenta
          </Button>
        </form>

        <footer className={styles.card__footer}>
          <p>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className={styles.card__link}>
              Inicia sesión
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};
