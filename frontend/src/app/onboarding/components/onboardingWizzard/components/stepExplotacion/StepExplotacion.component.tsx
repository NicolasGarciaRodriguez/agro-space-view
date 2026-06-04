"use client";

import { useState } from "react";
import { ExplotacionRepository } from "@agrospace/shared/repositories/Explotacion.repository";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type { ExplotacionDTO } from "@agrospace/shared/dtos/Explotacion.dto";
import styles from "./StepExplotacion.module.scss";

interface StepExplotacionProps {
  onCreated: (explotacion: ExplotacionDTO) => void;
}

export const StepExplotacion = ({ onCreated }: StepExplotacionProps) => {
  const [form, setForm] = useState({
    nombre: "",
    provincia: "",
    municipio: "",
    descripcion: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await ExplotacionRepository.create({
        nombre: form.nombre,
        provincia: form.provincia,
        municipio: form.municipio,
        descripcion: form.descripcion || undefined,
      });
      onCreated(data);
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al crear la explotación.")
          : "Error al crear la explotación.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.step}>
      <header className={styles.step__header}>
        <span className={styles.step__icon}>🌿</span>
        <h2 className={styles.step__title}>Tu explotación</h2>
        <p className={styles.step__description}>
          Dale nombre a tu explotación agrícola. Podrás añadir más adelante.
        </p>
      </header>

      <form className={styles.step__form} onSubmit={handleSubmit} noValidate>
        <Input
          id="nombre"
          name="nombre"
          type="text"
          label="Nombre de la explotación"
          placeholder="Finca Los Naranjos"
          value={form.nombre}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        <div className={styles.step__row}>
          <Input
            id="provincia"
            name="provincia"
            type="text"
            label="Provincia"
            placeholder="Sevilla"
            value={form.provincia}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <Input
            id="municipio"
            name="municipio"
            type="text"
            label="Municipio"
            placeholder="Alcalá de Guadaíra"
            value={form.municipio}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <Input
          id="descripcion"
          name="descripcion"
          type="text"
          label="Descripción (opcional)"
          placeholder="Explotación de naranjos y limoneros"
          value={form.descripcion}
          onChange={handleChange}
          disabled={isLoading}
        />

        {error && (
          <p className={styles.step__error} role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          size="lg"
          disabled={!form.nombre || !form.provincia || !form.municipio}
        >
          Continuar
        </Button>
      </form>
    </div>
  );
};
