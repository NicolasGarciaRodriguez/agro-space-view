"use client";

import { INDICE_ICONS } from "@agrospace/shared/config/IndiceVisuals.config";
import type { IndiceTipoSelectorProps } from "./IndiceTipoSelector.interface";
import styles from "./IndiceTipoSelector.module.scss";

export const IndiceTipoSelector = ({
  indices,
  tipoActivo,
  onChange,
  disabled,
}: IndiceTipoSelectorProps) => {
  if (indices.length === 0) return null;

  return (
    <div className={styles.selector}>
      {indices.map((indice) => (
        <button
          key={indice.tipo}
          className={[
            styles.selector__btn,
            styles[`selector__btn--${indice.tipo}`],
            tipoActivo === indice.tipo ? styles["selector__btn--active"] : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(indice.tipo)}
          disabled={disabled}
        >
          <span className={styles.selector__icon}>
            {INDICE_ICONS[indice.tipo]}
          </span>
          <span>{indice.label}</span>
        </button>
      ))}
    </div>
  );
};