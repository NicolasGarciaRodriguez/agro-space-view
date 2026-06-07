"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import { CuadernoEntradaRepository } from "@agrospace/shared/repositories/CuadernoEntrada.repository";
import { ParcelaRepository } from "@agrospace/shared/repositories/Parcela.repository";
import { AddEntradaCuadernoModal } from "@/components/addEntradaCuadernoModal/AddEntradaCuadernoModal.component";
import { CuadernoFiltros } from "./components/cuadernoFiltros/CuadernoFiltros.component";
import { CuadernoCard } from "@/components/cuadernoCard/CuadernoCard.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type {
  CuadernoEntradaDTO,
  EntradaTipo,
} from "@agrospace/shared/dtos/CuadernoEntrada.dto";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import type { CuadernoFiltrosValue } from "./components/cuadernoFiltros/CuadernoFiltros.interface";
import styles from "./CuadernoMain.module.scss";

export const CuadernoMain = () => {
  const router = useRouter();
  const activeExplotacion = useExplotacionStore((s) => s.activeExplotacion);

  const [entradas, setEntradas] = useState<CuadernoEntradaDTO[]>([]);
  const [parcelas, setParcelas] = useState<ParcelaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [entradaToEdit, setEntradaToEdit] = useState<CuadernoEntradaDTO | null>(
    null,
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<CuadernoFiltrosValue>({
    parcelaId: "",
    tipo: "",
    dateFrom: "",
    dateTo: "",
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const LIMIT = 20;

  useEffect(() => {
    if (!activeExplotacion) return;
    ParcelaRepository.getAll(activeExplotacion._id)
      .then(setParcelas)
      .catch(() => setParcelas([]));
  }, [activeExplotacion?._id]);

  const loadEntradas = useCallback(
    async (currentPage = 1) => {
      if (!activeExplotacion) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await CuadernoEntradaRepository.getAll({
          explotacionId: activeExplotacion._id,
          parcelaId: filtros.parcelaId || undefined,
          tipo: (filtros.tipo as EntradaTipo) || undefined,
          limit: LIMIT,
          page: currentPage,
        });
        setEntradas(data.entradas);
        setTotal(data.total);
      } catch (err) {
        setError(
          isHttpError(err)
            ? (err.message ?? "Error al cargar el cuaderno.")
            : "Error al cargar el cuaderno.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeExplotacion?._id, filtros],
  );

  useEffect(() => {
    setPage(1);
    loadEntradas(1);
  }, [filtros, activeExplotacion?._id]);

  const handleDelete = async (id: string) => {
    try {
      await CuadernoEntradaRepository.remove(id);
      setEntradas((prev) => prev.filter((e) => e._id !== id));
      setTotal((prev) => prev - 1);
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

  const handleEntradaCreated = async () => {
    setModalOpen(false);
    setEntradaToEdit(null);
    await loadEntradas(page);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadEntradas(newPage);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const parcelaMap = Object.fromEntries(parcelas.map((p) => [p._id, p]));

  if (!activeExplotacion) {
    return (
      <div className={styles.empty}>
        <p>No hay explotación activa.</p>
      </div>
    );
  }

  return (
    <div className={styles.cuaderno}>
      <header className={styles.cuaderno__header}>
        <div>
          <h1 className={styles.cuaderno__title}>Cuaderno de campo</h1>
          <p className={styles.cuaderno__subtitle}>
            {activeExplotacion.nombre} — {total}{" "}
            {total === 1 ? "entrada" : "entradas"}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Nueva entrada</Button>
      </header>

      <CuadernoFiltros
        parcelas={parcelas}
        value={filtros}
        onChange={setFiltros}
      />

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
            No hay entradas con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.cuaderno__list}>
            {entradas.map((entrada) => (
              <CuadernoCard
                key={entrada._id}
                entrada={entrada}
                parcela={parcelaMap[entrada.parcelaId]}
                confirmDeleteId={confirmDeleteId}
                onEdit={() => setEntradaToEdit(entrada)}
                onDeleteClick={() => handleDeleteClick(entrada._id)}
                onParcelaClick={() =>
                  router.push(`/dashboard/parcelas/${entrada.parcelaId}`)
                }
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.cuaderno__pagination}>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                ← Anterior
              </Button>
              <span className={styles.cuaderno__pagination__info}>
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <AddEntradaCuadernoModal
          parcelaId={filtros.parcelaId || (parcelas[0]?._id ?? "")}
          explotacionId={activeExplotacion._id}
          onCreated={handleEntradaCreated}
          onClose={() => setModalOpen(false)}
        />
      )}

      {entradaToEdit && (
        <AddEntradaCuadernoModal
          parcelaId={entradaToEdit.parcelaId}
          explotacionId={activeExplotacion._id}
          entradaToEdit={entradaToEdit}
          onCreated={handleEntradaCreated}
          onClose={() => setEntradaToEdit(null)}
        />
      )}
    </div>
  );
};
