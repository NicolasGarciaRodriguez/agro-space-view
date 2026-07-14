"use client";

import { useEffect, useState } from "react";
import { AnalisisRepository } from "@agrospace/shared/repositories/Analisis.repository";
import { isHttpError } from "@/lib/http-error";
import type {
  AnalisisDTO,
  IndiceDefinitionDTO,
} from "@agrospace/shared/dtos/Analisis.dto";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import type { ParcelaAnalisisProps } from "./ParcelaAnalisis.interface";
import styles from "./ParcelaAnalisis.module.scss";
import { INDICE_ICONS } from "@agrospace/shared/config/IndiceVisuals.config";
import { IndiceTipoSelector } from "@/components/indiceTipoSelector/IndiceTipoSelector.component";

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

const getRangeFor = (value: number, indice?: IndiceDefinitionDTO) => {
  if (!indice) return { label: "—", color: "#999" };
  return (
    indice.ranges.find((r) => value >= r.min && value < r.max) ??
    indice.ranges[indice.ranges.length - 1]
  );
};

export const ParcelaAnalisis = ({ parcelaId }: ParcelaAnalisisProps) => {
  const [indices, setIndices] = useState<IndiceDefinitionDTO[]>([]);
  const [tipoActivo, setTipoActivo] = useState<IndiceTipo>(IndiceTipo.NDVI);
  const [analisis, setAnalisis] = useState<AnalisisDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AnalisisRepository.getIndices()
      .then(setIndices)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await AnalisisRepository.getByParcela(
          parcelaId,
          tipoActivo,
          20,
        );
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
  }, [parcelaId, tipoActivo]);

  const indiceActivo = indices.find((i) => i.tipo === tipoActivo);

  return (
    <section className={styles.analisis}>
      <div className={styles.analisis__header}>
        <h2 className={styles.analisis__title}>Historial de análisis</h2>

        {indices.length > 0 && (
            <IndiceTipoSelector
              indices={indices}
              tipoActivo={tipoActivo}
              onChange={setTipoActivo}
            />
        )}
      </div>

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
          <p>
            No hay análisis de {indiceActivo?.label ?? tipoActivo} guardados
            aún.
          </p>
        </div>
      ) : (
        <div className={styles.analisis__tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.table__th}>Período</th>
                <th className={styles.table__th}>
                  {indiceActivo?.label ?? "Índice"} medio
                </th>
                <th className={styles.table__th}>Estado</th>
                <th className={styles.table__th}>Nubosidad</th>
                <th className={styles.table__th}>Temp. máx.</th>
                <th className={styles.table__th}>Lluvia</th>
                <th className={styles.table__th}>Analizado</th>
              </tr>
            </thead>
            <tbody>
              {analisis.map((a, i) => {
                const range = getRangeFor(a.indiceMedio, indiceActivo);
                const prev = analisis[i + 1];
                const diff = prev ? a.indiceMedio - prev.indiceMedio : null;

                return (
                  <tr key={a._id} className={styles.table__tr}>
                    <td className={styles.table__td}>
                      {formatPeriod(a.dateFrom, a.dateTo)}
                    </td>
                    <td className={styles.table__td}>
                      <div className={styles.indice}>
                        <span
                          className={styles.indice__dot}
                          style={{ background: range.color }}
                        />
                        <span className={styles.indice__value}>
                          {a.indiceMedio.toFixed(3)}
                        </span>
                        {diff !== null && (
                          <span
                            className={[
                              styles.indice__diff,
                              diff >= 0
                                ? styles["indice__diff--up"]
                                : styles["indice__diff--down"],
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
                        style={{ color: range.color, borderColor: range.color }}
                      >
                        {range.label}
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
