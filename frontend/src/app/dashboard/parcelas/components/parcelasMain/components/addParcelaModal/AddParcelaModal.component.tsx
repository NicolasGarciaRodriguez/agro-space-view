"use client";

import { useEffect, useState } from "react";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { ParcelaForm } from "@/components/parcelaForm/ParcelaForm.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type { ParcelaFormValues } from "@/components/parcelaForm/ParcelaForm.interface";
import type { AddParcelaModalProps } from "./AddParcelaModal.interface";
import styles from "./AddParcelaModal.module.scss";

export const AddParcelaModal = ({
  explotacionId,
  onCreated,
  onClose,
}: AddParcelaModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (values: ParcelaFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      await ParcelaRepository.create(explotacionId, {
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
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className={styles.modal__header}>
          <h2 id="modal-title" className={styles.modal__title}>
            Añadir parcela
          </h2>
          <button
            className={styles.modal__close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className={styles.modal__form}>
          <ParcelaForm
            isLoading={isLoading}
            error={error}
            onSubmit={handleSubmit}
            submitLabel="Añadir parcela"
          >
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </ParcelaForm>
        </div>
      </div>
    </div>
  );
};