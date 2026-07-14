"use client";

import { useState } from "react";
import { ExplotacionInvitationRepository } from "@agrospace/shared/repositories/ExplotacionInvitation.repository";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { Button } from "@/components/button/Button.component";
import { Input } from "@/components/input/Input.component";
import { isHttpError } from "@/lib/http-error";
import type { InviteCollaboratorModalProps } from "./InviteCollaboratorModal.interface";
import styles from "./InviteCollaboratorModal.module.scss";

export const InviteCollaboratorModal = ({
  explotaciones,
  onClose,
  onInvited,
}: InviteCollaboratorModalProps) => {
  const [email, setEmail] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [nivelAcceso, setNivelAcceso] = useState<NivelAcceso>(
    NivelAcceso.CONSULTA,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleExplotacion = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const canSubmit = email.trim().length > 0 && selectedIds.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await ExplotacionInvitationRepository.create({
        explotacionIds: selectedIds,
        email: email.trim(),
        nivelAcceso,
      });
      setSuccess(true);
      onInvited();
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al enviar la invitación.")
          : "Error al enviar la invitación.",
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
          <h2 className={styles.modal__title}>Invitar colaborador</h2>
          <button
            className={styles.modal__close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        {success ? (
          <div className={styles.modal__success}>
            <span className={styles.modal__success__icon}>✓</span>
            <p>Invitación enviada a {email}.</p>
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        ) : (
          <form className={styles.modal__form} onSubmit={handleSubmit} noValidate>
            <Input
              id="invite-email"
              type="email"
              label="Email del colaborador"
              placeholder="tecnico@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <div className={styles.modal__field}>
              <label className={styles.modal__label}>
                Explotaciones a compartir
              </label>
              <div className={styles.modal__checklist}>
                {explotaciones.map((ex) => (
                  <label key={ex._id} className={styles.modal__checkItem}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ex._id)}
                      onChange={() => toggleExplotacion(ex._id)}
                      disabled={isLoading}
                    />
                    <span>{ex.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.modal__field}>
              <label htmlFor="nivelAcceso" className={styles.modal__label}>
                Nivel de acceso
              </label>
              <select
                id="nivelAcceso"
                className={styles.modal__select}
                value={nivelAcceso}
                onChange={(e) => setNivelAcceso(e.target.value as NivelAcceso)}
                disabled={isLoading}
              >
                <option value={NivelAcceso.CONSULTA}>
                  Consulta — solo puede ver
                </option>
                <option value={NivelAcceso.GESTION}>
                  Gestión — puede ver y editar
                </option>
              </select>
            </div>

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
                Enviar invitación
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};