"use client";

import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import styles from "./ParcelaInfo.module.scss";

interface ParcelaInfoProps {
  parcela: ParcelaDTO;
}

const formatSuperficie = (m2: number): string => {
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(1)} ha`;
  return `${m2.toLocaleString("es-ES")} m²`;
};

export const ParcelaInfo = ({ parcela }: ParcelaInfoProps) => {
  return (
    <section className={styles.info}>
      <div className={styles.info__header}>
        <div>
          <h1 className={styles.info__name}>{parcela.nombre}</h1>
          {parcela.description && (
            <p className={styles.info__description}>{parcela.description}</p>
          )}
        </div>
        {parcela.tipoCultivo && (
          <span className={styles.info__cultivo}>{parcela.tipoCultivo}</span>
        )}
        {parcela.variedad && (
          <span className={styles.info__variedad}>{parcela.variedad}</span>
        )}
        {parcela.manejo && (
          <span className={styles.info__manejo}>{parcela.manejo}</span>
        )}
      </div>

      <div className={styles.info__grid}>
        <div className={styles.info__item}>
          <span className={styles.info__item__label}>Ref. catastral</span>
          <span className={styles.info__item__value}>
            {parcela.refCatastral}
          </span>
        </div>
        <div className={styles.info__item}>
          <span className={styles.info__item__label}>Superficie</span>
          <span className={styles.info__item__value}>
            {formatSuperficie(parcela.superficie)}
          </span>
        </div>
        <div className={styles.info__item}>
          <span className={styles.info__item__label}>Municipio</span>
          <span className={styles.info__item__value}>{parcela.municipio}</span>
        </div>
        <div className={styles.info__item}>
          <span className={styles.info__item__label}>Provincia</span>
          <span className={styles.info__item__value}>{parcela.provincia}</span>
        </div>
      </div>
    </section>
  );
};
