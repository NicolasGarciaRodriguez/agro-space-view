"use client";

import { useEffect, useState } from "react";
import { InsightRepository } from "@agrospace/shared/repositories/Insight.repository";
import { InsightAlertaNivel } from "@agrospace/shared/enums/InsightAlertaNivel.enum";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import type { InsightDTO } from "@agrospace/shared/dtos/Insight.dto";
import type { ParcelaInsightProps } from "./ParcelaInsight.interface";
import styles from "./ParcelaInsight.module.scss";

const ALERTA_CONFIG: Record<
  InsightAlertaNivel,
  { icon: string; modifier: string }
> = {
  [InsightAlertaNivel.NINGUNA]: { icon: "✓", modifier: "ninguna" },
  [InsightAlertaNivel.ATENCION]: { icon: "⚠", modifier: "atencion" },
  [InsightAlertaNivel.URGENTE]: { icon: "🔴", modifier: "urgente" },
};

const INDICE_LABELS: Record<IndiceTipo, string> = {
  [IndiceTipo.NDVI]: "NDVI",
  [IndiceTipo.NDWI]: "NDWI",
  [IndiceTipo.NDRE]: "NDRE",
};

const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const ParcelaInsight = ({ parcelaId }: ParcelaInsightProps) => {
  const [insight, setInsight] = useState<InsightDTO | null>(null);
  const [faltantes, setFaltantes] = useState<IndiceTipo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    InsightRepository.getByParcela(parcelaId)
      .then((result) => {
        setInsight(result.insight);
        setFaltantes(result.faltantes ?? []);
      })
      .finally(() => setIsLoading(false));
  }, [parcelaId]);

  if (isLoading) {
    return (
      <div className={styles.insight}>
        <div className={styles.insight__loading}>
          <span className={styles.insight__spinner} />
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className={styles.insight}>
        <div className={styles.insight__header}>
          <span className={styles.insight__icon}>🤖</span>
          <span className={styles.insight__title}>Diagnóstico IA</span>
        </div>
        <p className={styles.insight__empty}>
          {faltantes.length > 0
            ? `Analiza también ${faltantes.map((f) => INDICE_LABELS[f]).join(" y ")} para desbloquear el diagnóstico completo de esta parcela.`
            : "Aún no hay suficientes datos para generar un diagnóstico. Realiza un análisis satelital para empezar."}
        </p>
      </div>
    );
  }

  const alertaConfig = ALERTA_CONFIG[insight.contenido.alerta.nivel];

  return (
    <div className={styles.insight}>
      <div className={styles.insight__header}>
        <span className={styles.insight__icon}>🤖</span>
        <span className={styles.insight__title}>Diagnóstico IA</span>
        <span className={styles.insight__date}>
          {formatDate(insight.createdAt)}
        </span>
      </div>

      <div
        className={[
          styles.insight__alerta,
          styles[`insight__alerta--${alertaConfig.modifier}`],
        ].join(" ")}
      >
        <span className={styles.insight__alerta__icon}>
          {alertaConfig.icon}
        </span>
        <p className={styles.insight__resumen}>{insight.contenido.resumen}</p>
      </div>

      {insight.contenido.alerta.mensaje && (
        <p className={styles.insight__alertaMensaje}>
          {insight.contenido.alerta.mensaje}
        </p>
      )}

      {insight.contenido.hallazgos.length > 0 && (
        <ul className={styles.insight__hallazgos}>
          {insight.contenido.hallazgos.map((h, i) => (
            <li key={i} className={styles.insight__hallazgo}>
              {h}
            </li>
          ))}
        </ul>
      )}

      {insight.contenido.recomendacion && (
        <div className={styles.insight__recomendacion}>
          <span className={styles.insight__recomendacion__label}>
            Recomendación
          </span>
          <p>{insight.contenido.recomendacion}</p>
        </div>
      )}
    </div>
  );
};
