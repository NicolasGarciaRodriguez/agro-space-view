"use client";

import { useState } from "react";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
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
  const [form, setForm] = useState({
    refCatastral: "",
    nombre: "",
    cultivo: "",
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
      await ParcelaRepository.create(explotacion._id, {
        refCatastral: form.refCatastral.trim(),
        nombre: form.nombre,
        cultivo: form.cultivo || undefined,
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

  const canSubmit =
    form.refCatastral.trim().length >= 14 && form.nombre.trim().length > 0;

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

      <form className={styles.step__form} onSubmit={handleSubmit} noValidate>
        <Input
          id="refCatastral"
          name="refCatastral"
          type="text"
          label="Referencia catastral"
          placeholder="53006A09100025"
          value={form.refCatastral}
          onChange={handleChange}
          disabled={isLoading}
          maxLength={20}
          hint="Encuéntrala en la Sede Electrónica del Catastro"
          required
        />

        <Input
          id="nombre"
          name="nombre"
          type="text"
          label="Nombre de la parcela"
          placeholder="Sector norte"
          value={form.nombre}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        <Input
          id="cultivo"
          name="cultivo"
          type="text"
          label="Cultivo (opcional)"
          placeholder="Naranjos, Olivos, Cereales..."
          value={form.cultivo}
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
          disabled={!canSubmit}
        >
          Añadir parcela e ir al dashboard
        </Button>

        <button
          type="button"
          className={styles.step__skip}
          onClick={onSkip}
          disabled={isLoading}
        >
          Ahora no, ir al dashboard
        </button>
      </form>
    </div>
  );
};
