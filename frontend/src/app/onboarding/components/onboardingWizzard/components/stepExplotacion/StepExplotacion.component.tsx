"use client";

import { useState } from "react";
import { ExplotacionRepository } from "@agrospace/shared/repositories/Explotacion.repository";
import { ExplotacionForm } from "@/components/explotacionForm/ExplotacionForm.component";
import { isHttpError } from "@/lib/http-error";
import type { ExplotacionDTO } from "@agrospace/shared/dtos/Explotacion.dto";
import type { ExplotacionFormValues } from "@/components/explotacionForm/ExplotacionForm.interface";
import styles from "./StepExplotacion.module.scss";

interface StepExplotacionProps {
  onCreated: (explotacion: ExplotacionDTO) => void;
}

export const StepExplotacion = ({ onCreated }: StepExplotacionProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: ExplotacionFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await ExplotacionRepository.create({
        nombre: values.nombre,
        provincia: values.provincia,
        municipio: values.municipio,
        descripcion: values.descripcion || undefined,
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

      <ExplotacionForm
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        submitLabel="Continuar"
      />
    </div>
  );
};