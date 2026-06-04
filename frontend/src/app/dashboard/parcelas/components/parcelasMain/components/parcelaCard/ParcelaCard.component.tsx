"use client";

import { useState } from "react";
import type { ParcelaCardProps } from "./ParcelaCard.interface";
import styles from "./ParcelaCard.module.scss";

const formatSuperficie = (m2: number): string => {
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(1)} ha`;
  return `${m2.toLocaleString("es-ES")} m²`;
};

export const ParcelaCard = ({
  parcela,
  onClick,
  onDelete,
}: ParcelaCardProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.card__header}>
        <span className={styles.card__icon}>🌿</span>
        <button
          className={styles.card__delete}
          onClick={handleDelete}
          title={confirmDelete ? "Confirmar eliminación" : "Eliminar parcela"}
        >
          {confirmDelete ? "⚠ Confirmar" : "✕"}
        </button>
      </div>

      <div className={styles.card__body}>
        <h3 className={styles.card__name}>{parcela.nombre}</h3>

        {parcela.cultivo && (
          <span className={styles.card__cultivo}>{parcela.cultivo}</span>
        )}

        <div className={styles.card__meta}>
          <div className={styles.card__meta__item}>
            <span className={styles.card__meta__label}>Ref. catastral</span>
            <span className={styles.card__meta__value}>
              {parcela.refCatastral}
            </span>
          </div>
          <div className={styles.card__meta__item}>
            <span className={styles.card__meta__label}>Superficie</span>
            <span className={styles.card__meta__value}>
              {formatSuperficie(parcela.superficie)}
            </span>
          </div>
          <div className={styles.card__meta__item}>
            <span className={styles.card__meta__label}>Municipio</span>
            <span className={styles.card__meta__value}>
              {parcela.municipio}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.card__footer}>
        <span className={styles.card__cta}>Ver detalle →</span>
      </div>
    </div>
  );
};
