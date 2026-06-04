"use client";

import { useEffect, useState } from "react";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { Input } from "@/components/input/Input.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type { AddParcelaModalProps } from "./AddParcelaModal.interface";
import styles from "./AddParcelaModal.module.scss";

export const AddParcelaModal = ({
  explotacionId,
  onCreated,
  onClose,
}: AddParcelaModalProps) => {
  const [form, setForm] = useState({
    refCatastral: "",
    nombre: "",
    cultivo: "",
  });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await ParcelaRepository.create(explotacionId, {
        refCatastral: form.refCatastral.trim(),
        nombre: form.nombre.trim(),
        cultivo: form.cultivo.trim() || undefined,
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

        <form className={styles.modal__form} onSubmit={handleSubmit} noValidate>
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
            <p className={styles.modal__error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.modal__actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading} disabled={!canSubmit}>
              Añadir parcela
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
