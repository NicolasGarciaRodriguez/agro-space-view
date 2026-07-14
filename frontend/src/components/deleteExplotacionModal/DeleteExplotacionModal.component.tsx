"use client";

import { useState } from "react";
import { ExplotacionRepository } from "@agrospace/shared/repositories/Explotacion.repository";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type { DeleteExplotacionModalProps } from "./DeleteExplotacionModal.interface";
import styles from "./DeleteExplotacionModal.module.scss";

export const DeleteExplotacionModal = ({
  explotacionId,
  explotacionNombre,
  onDeleted,
  onClose,
}: DeleteExplotacionModalProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim() === explotacionNombre;

  const handleDelete = async () => {
    if (!canDelete) return;
    setError(null);
    setIsLoading(true);

    try {
      await ExplotacionRepository.remove(explotacionId);
      onDeleted();
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al eliminar la explotación.")
          : "Error al eliminar la explotación.",
      );
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
          <h2 className={styles.modal__title}>Eliminar explotación</h2>
          <button
            className={styles.modal__close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className={styles.modal__body}>
          <p className={styles.modal__warning}>
            ⚠️ Esta acción es <strong>irreversible</strong>. Se eliminarán
            permanentemente:
          </p>
          <ul className={styles.modal__list}>
            <li>Todas las parcelas de esta explotación</li>
            <li>Todos los análisis satelitales y su histórico</li>
            <li>Todas las entradas del cuaderno de campo</li>
            <li>Todos los diagnósticos generados por IA</li>
            <li>El acceso de todos los colaboradores invitados</li>
          </ul>

          <label className={styles.modal__label}>
            Para confirmar, escribe el nombre de la explotación:{" "}
            <strong>{explotacionNombre}</strong>
          </label>
          <input
            type="text"
            className={styles.modal__input}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={explotacionNombre}
            disabled={isLoading}
            autoComplete="off"
          />

          {error && (
            <p className={styles.modal__error} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={styles.modal__actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            loading={isLoading}
            disabled={!canDelete}
          >
            Eliminar definitivamente
          </Button>
        </div>
      </div>
    </div>
  );
};