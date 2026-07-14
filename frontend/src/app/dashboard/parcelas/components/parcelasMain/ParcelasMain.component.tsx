"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { ParcelaCard } from "./components/parcelaCard/ParcelaCard.component";
import { AddParcelaModal } from "./components/addParcelaModal/AddParcelaModal.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import { canManage } from "@/lib/access";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import styles from "./ParcelasMain.module.scss";

export const ParcelasMain = () => {
  const router = useRouter();
  const activeExplotacion = useExplotacionStore((s) => s.activeExplotacion);

  const [parcelas, setParcelas] = useState<ParcelaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const puedeGestionar = canManage(activeExplotacion?.nivelAcceso);

  const loadParcelas = async () => {
    if (!activeExplotacion) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ParcelaRepository.getAll(activeExplotacion._id);
      setParcelas(data);
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al cargar las parcelas.")
          : "Error al cargar las parcelas.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParcelas();
  }, [activeExplotacion?._id]);

  const handleParcelaCreated = async () => {
    setModalOpen(false);
    await loadParcelas();
  };

  const handleParcelaDeleted = async (id: string) => {
    if (!activeExplotacion) return;
    try {
      await ParcelaRepository.remove(activeExplotacion._id, id);
      setParcelas((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(
        isHttpError(err)
          ? (err.message ?? "Error al eliminar la parcela.")
          : "Error al eliminar la parcela.",
      );
    }
  };

  return (
    <div className={styles.parcelas}>
      <header className={styles.parcelas__header}>
        <div>
          <h1 className={styles.parcelas__title}>Parcelas</h1>
          {activeExplotacion && (
            <p className={styles.parcelas__subtitle}>
              {activeExplotacion.nombre} — {parcelas.length}{" "}
              {parcelas.length === 1 ? "parcela" : "parcelas"}
            </p>
          )}
        </div>
        {puedeGestionar && (
          <Button onClick={() => setModalOpen(true)} size="md">
            + Añadir parcela
          </Button>
        )}
      </header>

      {error && (
        <p className={styles.parcelas__error} role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className={styles.parcelas__loading}>
          <span className={styles.parcelas__spinner} />
        </div>
      ) : parcelas.length === 0 ? (
        <div className={styles.parcelas__empty}>
          <span className={styles.parcelas__empty__icon}>🗺</span>
          <p className={styles.parcelas__empty__text}>
            No hay parcelas en esta explotación.
          </p>
          {puedeGestionar && (
            <Button onClick={() => setModalOpen(true)} variant="secondary">
              Añadir primera parcela
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.parcelas__grid}>
          {parcelas.map((parcela) => (
            <ParcelaCard
              key={parcela._id}
              parcela={parcela}
              onClick={() => router.push(`/dashboard/parcelas/${parcela._id}`)}
              onDelete={() => handleParcelaDeleted(parcela._id)}
              canDelete={puedeGestionar}
            />
          ))}
        </div>
      )}

      {modalOpen && activeExplotacion && (
        <AddParcelaModal
          explotacionId={activeExplotacion._id}
          onCreated={handleParcelaCreated}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};