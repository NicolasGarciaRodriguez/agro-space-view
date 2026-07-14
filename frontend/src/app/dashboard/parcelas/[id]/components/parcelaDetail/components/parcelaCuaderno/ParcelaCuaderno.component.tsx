"use client";

import { useEffect, useState } from "react";
import { CuadernoEntradaRepository } from "@agrospace/shared/repositories/CuadernoEntrada.repository";
import { AddEntradaCuadernoModal } from "@/components/addEntradaCuadernoModal/AddEntradaCuadernoModal.component";
import { Button } from "@/components/button/Button.component";
import { CuadernoCard } from "@/components/cuadernoCard/CuadernoCard.component";
import { isHttpError } from "@/lib/http-error";
import { canManage } from "@/lib/access";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import type { CuadernoEntradaDTO } from "@agrospace/shared/dtos/CuadernoEntrada.dto";
import type { ParcelaCuadernoProps } from "./ParcelaCuaderno.interface";
import styles from "./ParcelaCuaderno.module.scss";

export const ParcelaCuaderno = ({
  parcelaId,
  explotacionId,
}: ParcelaCuadernoProps) => {
  const activeExplotacion = useExplotacionStore((s) => s.activeExplotacion);
  const puedeGestionar = canManage(activeExplotacion?.nivelAcceso);

  const [entradas, setEntradas] = useState<CuadernoEntradaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [entradaToEdit, setEntradaToEdit] = useState<CuadernoEntradaDTO | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);

  const loadEntradas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CuadernoEntradaRepository.getAll({ parcelaId });
      setEntradas(data.entradas);
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al cargar el cuaderno.")
          : "Error al cargar el cuaderno.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntradas();
  }, [parcelaId]);

  const handleEntradaCreated = async () => {
    setModalOpen(false);
    await loadEntradas();
  };

  const handleDelete = async (id: string) => {
    try {
      await CuadernoEntradaRepository.remove(id);
      setEntradas((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al eliminar la entrada.")
          : "Error al eliminar la entrada.",
      );
    }
  };

  const handleDeleteClick = (id: string) => {
    if (confirmDeleteId === id) {
      handleDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <section className={styles.cuaderno}>
      <div className={styles.cuaderno__header}>
        <h2 className={styles.cuaderno__title}>Cuaderno de campo</h2>
        {puedeGestionar && (
          <Button size="sm" onClick={() => setModalOpen(true)}>
            + Nueva entrada
          </Button>
        )}
      </div>

      {error && (
        <p className={styles.cuaderno__error} role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className={styles.cuaderno__loading}>
          <span className={styles.cuaderno__spinner} />
        </div>
      ) : entradas.length === 0 ? (
        <div className={styles.cuaderno__empty}>
          <span className={styles.cuaderno__empty__icon}>📓</span>
          <p className={styles.cuaderno__empty__text}>
            No hay entradas en el cuaderno. Registra riegos, fertilizaciones,
            tratamientos y cosechas.
          </p>
          {puedeGestionar && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(true)}
            >
              Añadir primera entrada
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.cuaderno__list}>
          {entradas.map((entrada) => (
            <CuadernoCard
              key={entrada._id}
              entrada={entrada}
              variant="nested"
              confirmDeleteId={confirmDeleteId}
              onEdit={() => setEntradaToEdit(entrada)}
              onDeleteClick={() => handleDeleteClick(entrada._id)}
              canManage={puedeGestionar}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <AddEntradaCuadernoModal
          parcelaId={parcelaId}
          explotacionId={explotacionId}
          onCreated={handleEntradaCreated}
          onClose={() => setModalOpen(false)}
        />
      )}

      {entradaToEdit && (
        <AddEntradaCuadernoModal
          parcelaId={parcelaId}
          explotacionId={explotacionId}
          entradaToEdit={entradaToEdit}
          onCreated={async () => {
            setEntradaToEdit(null);
            await loadEntradas();
          }}
          onClose={() => setEntradaToEdit(null)}
        />
      )}
    </section>
  );
};