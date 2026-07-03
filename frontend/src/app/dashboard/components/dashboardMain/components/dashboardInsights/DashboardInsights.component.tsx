"use client";

import { useEffect, useState } from "react";
import { InsightRepository } from "@agrospace/shared/repositories/Insight.repository";
import { InsightAlertaNivel } from "@agrospace/shared/enums/InsightAlertaNivel.enum";
import type { InsightDTO } from "@agrospace/shared/dtos/Insight.dto";
import styles from "./DashboardInsights.module.scss";
import { DashboardInsightsProps } from "./DashboardInsights.interface";

const ALERTA_CONFIG: Record<
  InsightAlertaNivel,
  { icon: string; modifier: string }
> = {
  [InsightAlertaNivel.NINGUNA]: { icon: "✓", modifier: "ninguna" },
  [InsightAlertaNivel.ATENCION]: { icon: "⚠", modifier: "atencion" },
  [InsightAlertaNivel.URGENTE]: { icon: "🔴", modifier: "urgente" },
};

export const DashboardInsights = ({
  explotacion,
  parcelas,
}: DashboardInsightsProps) => {
  const [insight, setInsight] = useState<InsightDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!explotacion) return;

    const load = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const data = await InsightRepository.getByExplotacion(explotacion._id);
        setInsight(data);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [explotacion?._id]);

  const hayParcelasAnalizadas = parcelas.length > 0;

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
      </div>

      {isLoading ? (
        <div className={styles.insights__loading}>
          <span className={styles.insights__spinner} />
        </div>
      ) : !hayParcelasAnalizadas || error || !insight ? (
        <div className={styles.insights__placeholder}>
          <p className={styles.insights__placeholder__text}>
            {hayParcelasAnalizadas
              ? "Aún no hay suficientes análisis para generar recomendaciones. Analiza tus parcelas para empezar a recibir insights."
              : "Añade parcelas y realiza tu primer análisis satelital para recibir recomendaciones inteligentes."}
          </p>
        </div>
      ) : (
        <div className={styles.insights__content}>
          <div
            className={[
              styles.insights__alerta,
              styles[
                `insights__alerta--${ALERTA_CONFIG[insight.contenido.alerta.nivel].modifier}`
              ],
            ].join(" ")}
          >
            <span className={styles.insights__alerta__icon}>
              {ALERTA_CONFIG[insight.contenido.alerta.nivel].icon}
            </span>
            <p className={styles.insights__resumen}>
              {insight.contenido.resumen}
            </p>
          </div>

          {insight.contenido.alerta.mensaje && (
            <p className={styles.insights__alertaMensaje}>
              {insight.contenido.alerta.mensaje}
            </p>
          )}

          {insight.contenido.hallazgos.length > 0 && (
            <ul className={styles.insights__hallazgos}>
              {insight.contenido.hallazgos.map((h, i) => (
                <li key={i} className={styles.insights__hallazgo}>
                  {h}
                </li>
              ))}
            </ul>
          )}

          {insight.contenido.recomendacion && (
            <div className={styles.insights__recomendacion}>
              <span className={styles.insights__recomendacion__label}>
                Recomendación
              </span>
              <p>{insight.contenido.recomendacion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
