"use client";

import type { ExplotacionDTO } from "@agrospace/shared/dtos/Explotacion.dto";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import styles from "./DashboardInsights.module.scss";
import { DashboardInsightsProps } from "./DashboardInsights.interface";

export const DashboardInsights = ({
  explotacion,
  parcelas,
}: DashboardInsightsProps) => {
  return (
    <div className={styles.insights}>
      <div className={styles.insights__header}>
        <span className={styles.insights__icon}>🤖</span>
        <div>
          <h2 className={styles.insights__title}>Análisis IA</h2>
          <p className={styles.insights__subtitle}>
            Recomendaciones basadas en tus datos
          </p>
        </div>
        <span className={styles.insights__badge}>Próximamente</span>
      </div>

      <div className={styles.insights__placeholder}>
        <p className={styles.insights__placeholder__text}>
          Pronto podrás recibir análisis inteligentes sobre el estado de tus
          cultivos, recomendaciones de riego y alertas tempranas de estrés
          hídrico basadas en datos satelitales y meteorológicos.
        </p>
        <div className={styles.insights__examples}>
          {[
            "📉 Bajada de NDVI detectada en Sector Norte — posible estrés hídrico",
            "🌧 Sin lluvia en 14 días — considera riego preventivo",
            "✅ Parcela Camping Arcoiris en buen estado — NDVI 0.62",
          ].map((example) => (
            <div key={example} className={styles.insights__example}>
              {example}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
