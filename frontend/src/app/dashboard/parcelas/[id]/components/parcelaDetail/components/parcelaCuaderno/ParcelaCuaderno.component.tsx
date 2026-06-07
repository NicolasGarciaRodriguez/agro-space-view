"use client";

import { useEffect, useState } from "react";
import { CuadernoEntradaRepository } from "@agrospace/shared/repositories/CuadernoEntrada.repository";
import { AddEntradaCuadernoModal } from "@/components/addEntradaCuadernoModal/AddEntradaCuadernoModal.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type { CuadernoEntradaDTO } from "@agrospace/shared/dtos/CuadernoEntrada.dto";
import type { ParcelaCuadernoProps } from "./ParcelaCuaderno.interface";
import { TIPO_CONFIG } from "@/components/addEntradaCuadernoModal/AddEntradaCuadernoModal.interface";
import styles from "./ParcelaCuaderno.module.scss";

const formatFecha = (fecha: string): string =>
  new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const ParcelaCuaderno = ({
  parcelaId,
  explotacionId,
}: ParcelaCuadernoProps) => {
  const [entradas, setEntradas] = useState<CuadernoEntradaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [entradaToEdit, setEntradaToEdit] = useState<CuadernoEntradaDTO | null>(
    null,
  );

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
        <Button size="sm" onClick={() => setModalOpen(true)}>
          + Nueva entrada
        </Button>
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            Añadir primera entrada
          </Button>
        </div>
      ) : (
        <div className={styles.cuaderno__list}>
          {entradas.map((entrada) => {
            const config = TIPO_CONFIG[entrada.tipo];
            return (
              <div key={entrada._id} className={styles.entrada}>
                <div className={styles.entrada__left}>
                  <span className={styles.entrada__icon}>{config.icon}</span>
                  <div className={styles.entrada__content}>
                    <div className={styles.entrada__tipo}>{config.label}</div>
                    <div className={styles.entrada__fecha}>
                      {formatFecha(entrada.fecha)}
                    </div>
                    {entrada.notas && (
                      <div className={styles.entrada__notas}>
                        {entrada.notas}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.entrada__datos}>
                  {Object.entries(entrada.datos)
                    .filter(([, v]) => v !== undefined && v !== "")
                    .map(([k, v]) => (
                      <span key={k} className={styles.entrada__dato}>
                        {k}: <strong>{String(v)}</strong>
                      </span>
                    ))}
                </div>
                <div className={styles.entrada__actions}>
                  <button
                    className={styles.entrada__edit}
                    onClick={() => setEntradaToEdit(entrada)}
                    title="Editar entrada"
                  >
                    ✎
                  </button>
                  <button
                    className={[
                      styles.entrada__delete,
                      confirmDeleteId === entrada._id
                        ? styles["entrada__delete--confirm"]
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleDeleteClick(entrada._id)}
                    title={
                      confirmDeleteId === entrada._id
                        ? "Confirmar eliminación"
                        : "Eliminar entrada"
                    }
                  >
                    {confirmDeleteId === entrada._id ? "⚠ Confirmar" : "✕"}
                  </button>
                </div>
              </div>
            );
          })}
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
