import type { IndiceDefinitionDTO } from "@agrospace/shared/dtos/Analisis.dto";
import styles from "./AnalisisLegend.module.scss";

interface AnalisisLegendProps {
  indice: IndiceDefinitionDTO;
}

export const AnalisisLegend = ({ indice }: AnalisisLegendProps) => {
  return (
    <div className={styles.legend}>
      <p className={styles.legend__title}>Leyenda {indice.label}</p>
      <div className={styles.legend__items}>
        {indice.ranges.map((range) => (
          <div key={range.label} className={styles.legend__item}>
            <span
              className={styles.legend__color}
              style={{ background: range.color }}
            />
            <span className={styles.legend__range}>
              {range.min} – {range.max}
            </span>
            <span className={styles.legend__label}>{range.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
