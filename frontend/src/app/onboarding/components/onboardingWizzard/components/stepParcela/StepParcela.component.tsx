"use client";

import { useState } from "react";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { ParcelaForm } from "@/components/parcelaForm/ParcelaForm.component";
import { isHttpError } from "@/lib/http-error";
import type { ParcelaFormValues } from "@/components/parcelaForm/ParcelaForm.interface";
import type { ExplotacionDTO } from "@agrospace/shared/dtos/Explotacion.dto";
import styles from "./StepParcela.module.scss";

interface StepParcelaProps {
  explotacion: ExplotacionDTO;
  onCreated: () => void;
  onSkip: () => void;
}

export const StepParcela = ({
  explotacion,
  onCreated,
  onSkip,
}: StepParcelaProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: ParcelaFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      await ParcelaRepository.create(explotacion._id, {
        refCatastral: values.refCatastral.trim(),
        nombre: values.nombre.trim(),
        tipoCultivo: (values.tipoCultivo || undefined) as never,
        variedad: values.variedad.trim() || undefined,
        manejo: values.manejo as never,
      });
      onCreated();
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al añadir la parcela.")
          : "Error al añadir la parcela.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.step}>
      <header className={styles.step__header}>
        <span className={styles.step__icon}>🛰</span>
        <h2 className={styles.step__title}>Primera parcela</h2>
        <p className={styles.step__description}>
          Añade tu primera parcela de{" "}
          <strong className={styles.step__highlight}>
            {explotacion.nombre}
          </strong>{" "}
          usando su referencia catastral.
        </p>
      </header>

      <ParcelaForm
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        submitLabel="Añadir parcela e ir al dashboard"
      >
        <button
          type="button"
          className={styles.step__skip}
          onClick={onSkip}
          disabled={isLoading}
        >
          Ahora no, ir al dashboard
        </button>
      </ParcelaForm>
    </div>
  );
};
