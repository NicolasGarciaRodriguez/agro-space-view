"use client";

import type { EntradaCuadernoFormProps } from "../../AddEntradaCuadernoModal.interface";
import styles from "./EntradaCuadernoObservacion.module.scss";

export const EntradaCuadernoObservacion = ({
  datos,
  onChange,
  disabled,
}: EntradaCuadernoFormProps) => {
  return (
    <div className={styles.observacion}>
      <label className={styles.observacion__label} htmlFor="texto">
        Observación
      </label>
      <textarea
        id="texto"
        className={styles.observacion__textarea}
        value={datos.texto ?? ""}
        onChange={(e) =>
          onChange({ ...datos, texto: e.target.value || undefined })
        }
        placeholder="Describe lo que has observado en la parcela..."
        rows={5}
        disabled={disabled}
      />
    </div>
  );
};
