"use client";

import { TIPO_CONFIG } from "@/components/addEntradaCuadernoModal/AddEntradaCuadernoModal.interface";
import type { CuadernoEntradaCardProps } from "./CuadernoEntradaCard.interface";
import styles from "./CuadernoEntradaCard.module.scss";

const formatFecha = (fecha: string): string =>
  new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const CuadernoEntradaCard = ({
  entrada,
  parcela,
  confirmDeleteId,
  onEdit,
  onDeleteClick,
  onParcelaClick,
}: CuadernoEntradaCardProps) => {
  const config = TIPO_CONFIG[entrada.tipo];
  const isConfirmingDelete = confirmDeleteId === entrada._id;

  return (
    <div className={styles.card}>
      <div className={styles.card__left}>
        <span className={styles.card__icon}>{config.icon}</span>
        <div className={styles.card__info}>
          <div className={styles.card__tipo}>{config.label}</div>
          <div className={styles.card__fecha}>{formatFecha(entrada.fecha)}</div>
          {parcela && (
            <button
              className={styles.card__parcela}
              onClick={onParcelaClick}
              title="Ver parcela"
            >
              🗺 {parcela.nombre}
            </button>
          )}
          {entrada.notas && (
            <div className={styles.card__notas}>{entrada.notas}</div>
          )}
        </div>
      </div>

      <div className={styles.card__datos}>
        {Object.entries(entrada.datos)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => (
            <span key={k} className={styles.card__dato}>
              {k}: <strong>{String(v)}</strong>
            </span>
          ))}
      </div>

      <div className={styles.card__actions}>
        <button
          className={styles.card__edit}
          onClick={onEdit}
          title="Editar entrada"
        >
          ✎
        </button>
        <button
          className={[
            styles.card__delete,
            isConfirmingDelete ? styles["card__delete--confirm"] : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onDeleteClick}
          title={
            isConfirmingDelete ? "Confirmar eliminación" : "Eliminar entrada"
          }
        >
          {isConfirmingDelete ? "⚠ Confirmar" : "✕"}
        </button>
      </div>
    </div>
  );
};
