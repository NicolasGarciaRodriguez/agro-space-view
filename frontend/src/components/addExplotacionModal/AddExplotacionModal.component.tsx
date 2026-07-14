// components/addExplotacionModal/AddExplotacionModal.component.tsx
"use client";

import { useEffect, useState } from "react";
import { ExplotacionRepository } from "@agrospace/shared/repositories/Explotacion.repository";
import { ExplotacionForm } from "@/components/explotacionForm/ExplotacionForm.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type { ExplotacionFormValues } from "@/components/explotacionForm/ExplotacionForm.interface";
import type { ExplotacionDTO } from "@agrospace/shared/dtos/Explotacion.dto";
import styles from "./AddExplotacionModal.module.scss";

interface AddExplotacionModalProps {
  onCreated: (explotacion: ExplotacionDTO) => void;
  onClose: () => void;
}

export const AddExplotacionModal = ({
  onCreated,
  onClose,
}: AddExplotacionModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

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
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className={styles.modal__header}>
          <h2 className={styles.modal__title}>Nueva explotación</h2>
          <button
            className={styles.modal__close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className={styles.modal__form}>
          <ExplotacionForm
            isLoading={isLoading}
            error={error}
            onSubmit={handleSubmit}
            submitLabel="Crear explotación"
          >
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </ExplotacionForm>
        </div>
      </div>
    </div>
  );
};