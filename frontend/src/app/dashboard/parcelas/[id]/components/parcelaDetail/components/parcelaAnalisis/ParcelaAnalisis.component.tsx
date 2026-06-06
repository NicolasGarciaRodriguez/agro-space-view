// ParcelaAnalisis.component.tsx
"use client";

import { useEffect, useState } from "react";
import { AnalisisNdviRepository } from "@agrospace/shared/repositories/AnalisisNdvi.repository";
import { isHttpError } from "@/lib/http-error";
import type { AnalisisNdviDTO } from "@agrospace/shared/dtos/AnalisisNdvi.dto";
import type { ParcelaAnalisisProps } from "./ParcelaAnalisis.interface";
import styles from "./ParcelaAnalisis.module.scss";

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatPeriod = (from: string, to: string): string => {
  const f = new Date(from).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
  const t = new Date(to).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${f} — ${t}`;
};

const getNdviColor = (ndvi: number): string => {
  if (ndvi >= 0.6) return "var(--ndvi-good)";
  if (ndvi >= 0.3) return "var(--ndvi-moderate)";
  return "var(--ndvi-bad)";
};

const getNdviLabel = (ndvi: number): string => {
  if (ndvi >= 0.6) return "Sana";
  if (ndvi >= 0.3) return "Moderada";
  return "Estrés";
};

export const ParcelaAnalisis = ({ parcelaId }: ParcelaAnalisisProps) => {
  const [analisis, setAnalisis] = useState<AnalisisNdviDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await AnalisisNdviRepository.getByParcela(parcelaId, 20);
        setAnalisis(data);
      } catch (err) {
        setError(
          isHttpError(err)
            ? (err.message ?? "Error al cargar los análisis.")
            : "Error al cargar los análisis.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [parcelaId]);

  return (
    <section className={styles.analisis}>
      <h2 className={styles.analisis__title}>Historial de análisis</h2>

      {error && (
        <p className={styles.analisis__error} role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className={styles.analisis__loading}>
          <span className={styles.analisis__spinner} />
        </div>
      ) : analisis.length === 0 ? (
        <div className={styles.analisis__empty}>
          <span>📊</span>
          <p>No hay análisis guardados aún. Realiza tu primer análisis NDVI.</p>
        </div>
      ) : (
        <div className={styles.analisis__tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.table__th}>Período</th>
                <th className={styles.table__th}>NDVI medio</th>
                <th className={styles.table__th}>Estado</th>
                <th className={styles.table__th}>Nubosidad</th>
                <th className={styles.table__th}>Temp. máx.</th>
                <th className={styles.table__th}>Lluvia</th>
                <th className={styles.table__th}>Analizado</th>
              </tr>
            </thead>
            <tbody>
              {analisis.map((a, i) => {
                const color = getNdviColor(a.ndviMedio);
                const prev = analisis[i + 1];
                const diff = prev ? a.ndviMedio - prev.ndviMedio : null;

                return (
                  <tr key={a._id} className={styles.table__tr}>
                    <td className={styles.table__td}>
                      {formatPeriod(a.dateFrom, a.dateTo)}
                    </td>
                    <td className={styles.table__td}>
                      <div className={styles.ndvi}>
                        <span
                          className={styles.ndvi__dot}
                          style={{ background: color }}
                        />
                        <span className={styles.ndvi__value}>
                          {a.ndviMedio.toFixed(3)}
                        </span>
                        {diff !== null && (
                          <span
                            className={[
                              styles.ndvi__diff,
                              diff >= 0
                                ? styles["ndvi__diff--up"]
                                : styles["ndvi__diff--down"],
                            ].join(" ")}
                          >
                            {diff >= 0 ? "▲" : "▼"} {Math.abs(diff).toFixed(3)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={styles.table__td}>
                      <span
                        className={styles.badge}
                        style={{ color, borderColor: color }}
                      >
                        {getNdviLabel(a.ndviMedio)}
                      </span>
                    </td>
                    <td className={styles.table__td}>
                      {a.cloudCover.toFixed(1)}%
                    </td>
                    <td className={styles.table__td}>{a.clima.tempMaxAvg}°C</td>
                    <td className={styles.table__td}>
                      {a.clima.totalPrecipitation} mm
                    </td>
                    <td className={styles.table__td}>
                      {formatDate(a.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
