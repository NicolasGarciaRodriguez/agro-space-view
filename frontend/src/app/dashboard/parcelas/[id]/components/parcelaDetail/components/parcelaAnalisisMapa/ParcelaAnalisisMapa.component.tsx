"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnalisisRepository } from "@agrospace/shared/repositories/Analisis.repository";
import { WeatherRepository } from "@agrospace/shared/repositories/Weather.repository";
import { AnalisisMetadataCard } from "@/components/analisisMetaCard/AnalisisMetaCard.component";
import { AnalisisChart } from "@/components/analisisChart/AnalisisChart.component";
import { AnalisisLegend } from "@/components/analisisMap/components/analisisLegend/AnalisisLegend.component";
import { DateRangePicker } from "@/components/dateRangePicker/DateRangePicker.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type { DateRangeValue } from "@/components/dateRangePicker/DateRangePicker.component";
import type { AnalysisResult } from "@agrospace/shared/repositories/Analisis.repository";
import type { WeatherSummaryDTO } from "@agrospace/shared/dtos/Weather.dto";
import type {
  TimeSeriesResponseDTO,
  AnalisisDTO,
  IndiceDefinitionDTO,
} from "@agrospace/shared/dtos/Analisis.dto";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import { DEFAULT_DATE_RANGE } from "./ParcelaAnalisisMapa.config";
import styles from "./ParcelaAnalisisMapa.module.scss";

const AnalisisMap = dynamic(
  () =>
    import("@/components/analisisMap/AnalisisMap.component").then(
      (m) => m.AnalisisMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className={styles.analisis__mapLoading}>Cargando mapa…</div>
    ),
  },
);

interface ParcelaAnalisisMapaProps {
  parcela: ParcelaDTO;
}

function getErrorMessage(err: unknown, fallback: string): string {
  return isHttpError(err) ? (err.message ?? fallback) : fallback;
}

const toMapParcel = (parcela: ParcelaDTO) => ({
  ref: parcela.refCatastral,
  area: parcela.superficie,
  description: parcela.description ?? "",
  center: parcela.center,
  bbox: parcela.bbox,
  polygon: parcela.polygon,
});

const formatAnalisisLabel = (analisis: AnalisisDTO): string => {
  const from = new Date(analisis.dateFrom).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const to = new Date(analisis.dateTo).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${from} → ${to} — ${analisis.indiceMedio.toFixed(3)}`;
};

export const ParcelaAnalisisMapa = ({ parcela }: ParcelaAnalisisMapaProps) => {
  const [indices, setIndices] = useState<IndiceDefinitionDTO[]>([]);
  const [tipoActivo, setTipoActivo] = useState<IndiceTipo>(IndiceTipo.NDVI);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] =
    useState<DateRangeValue>(DEFAULT_DATE_RANGE);

  const [analisisResult, setAnalisisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [weatherResult, setWeatherResult] = useState<WeatherSummaryDTO | null>(
    null,
  );
  const [timeSeriesResult, setTimeSeriesResult] =
    useState<TimeSeriesResponseDTO | null>(null);
  const [historial, setHistorial] = useState<AnalisisDTO[]>([]);
  const [selectedAnalisis, setSelectedAnalisis] = useState<AnalisisDTO | null>(
    null,
  );

  const clearError = useCallback(() => setError(null), []);

  const indiceActivo = indices.find((i) => i.tipo === tipoActivo);

  // Carga la lista de índices disponibles una sola vez
  useEffect(() => {
    AnalisisRepository.getIndices()
      .then(setIndices)
      .catch(() => {});
  }, []);

  // Carga el histórico del tipo activo cada vez que cambia parcela o tipo
  useEffect(() => {
    const loadHistorial = async () => {
      setIsLoadingHistory(true);
      try {
        const data = await AnalisisRepository.getByParcela(
          parcela._id,
          tipoActivo,
        );
        setHistorial(data);
        setSelectedAnalisis(data.length > 0 ? data[0] : null);
      } catch {
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistorial();
  }, [parcela._id, tipoActivo]);

  useEffect(() => {
    return () => {
      if (analisisResult?.imageUrl)
        URL.revokeObjectURL(analisisResult.imageUrl);
    };
  }, [analisisResult?.imageUrl]);

  // Reset al cambiar de parcela
  useEffect(() => {
    setAnalisisResult(null);
    setWeatherResult(null);
    setTimeSeriesResult(null);
    setSelectedAnalisis(null);
    setHistorial([]);
    clearError();
  }, [parcela._id]);

  const handleSelectAnalisis = (analisis: AnalisisDTO) => {
    setSelectedAnalisis(analisis);
    if (analisisResult?.imageUrl) URL.revokeObjectURL(analisisResult.imageUrl);
    setAnalisisResult(null);
    setWeatherResult(null);
    setTimeSeriesResult(null);
  };

  const handleChangeTipo = (tipo: IndiceTipo) => {
    setTipoActivo(tipo);
    if (analisisResult?.imageUrl) URL.revokeObjectURL(analisisResult.imageUrl);
    setAnalisisResult(null);
    setWeatherResult(null);
    setTimeSeriesResult(null);
    clearError();
  };

  const handleAnalyse = async () => {
    setIsLoading(true);
    clearError();
    setSelectedAnalisis(null);

    if (analisisResult?.imageUrl) URL.revokeObjectURL(analisisResult.imageUrl);

    try {
      const [analisis, weather, timeSeries] = await Promise.all([
        AnalisisRepository.analyse({
          tipo: tipoActivo,
          bbox: parcela.bbox,
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
          maxCloud: 20,
        }),
        WeatherRepository.getWeather({
          lat: parcela.center[1],
          lon: parcela.center[0],
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
        }),
        AnalisisRepository.getTimeSeries({
          tipo: tipoActivo,
          bbox: parcela.bbox,
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
          maxCloud: 20,
        }),
      ]);

      setAnalisisResult(analisis);
      setWeatherResult(weather);
      setTimeSeriesResult(timeSeries);

      AnalisisRepository.create({
        parcelaId: parcela._id,
        explotacionId: parcela.explotacionId,
        tipo: tipoActivo,
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
        indiceMedio:
          timeSeries.points.length > 0
            ? Math.round(
                (timeSeries.points.reduce((a, b) => a + b.mean, 0) /
                  timeSeries.points.length) *
                  1000,
              ) / 1000
            : 0,
        cloudCover: analisis.metadata.cloudCover,
        usedImageId: analisis.metadata.usedImageId,
        usedImageDate: analisis.metadata.usedImageDate,
        imageBase64: analisis.imageBase64,
        clima: weather.stats,
        timeSeries: timeSeries.points,
      })
        .then((saved) => {
          setHistorial((prev) => [saved, ...prev]);
        })
        .catch(() => {});
    } catch (err) {
      setAnalisisResult(null);
      setWeatherResult(null);
      setTimeSeriesResult(null);
      setError(
        getErrorMessage(
          err,
          `No se pudo analizar el ${indiceActivo?.label ?? tipoActivo}.`,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const mapParcel = toMapParcel(parcela);

  const mapAnalisis = analisisResult
    ? { imageUrl: analisisResult.imageUrl, metadata: analisisResult.metadata }
    : selectedAnalisis
      ? {
          imageUrl: selectedAnalisis.imageUrl,
          metadata: {
            tipo: selectedAnalisis.tipo,
            usedImageId: selectedAnalisis.usedImageId,
            usedImageDate: selectedAnalisis.usedImageDate,
            cloudCover: selectedAnalisis.cloudCover,
            bbox: parcela.bbox,
          },
        }
      : undefined;

  const displayWeather =
    weatherResult ??
    (selectedAnalisis?.clima
      ? { stats: selectedAnalisis.clima, days: [] }
      : null);

  const displayTimeSeries =
    timeSeriesResult ??
    (selectedAnalisis?.timeSeries
      ? {
          points: selectedAnalisis.timeSeries,
          bbox: parcela.bbox,
          dateFrom: "",
          dateTo: "",
        }
      : null);

  return (
    <section className={styles.analisis}>
      <div className={styles.analisis__header}>
        <h2 className={styles.analisis__title}>Análisis satelital</h2>

        {indices.length > 0 && (
          <div className={styles.analisis__tipoSelector}>
            {indices.map((indice) => (
              <button
                key={indice.tipo}
                className={[
                  styles.analisis__tipoBtn,
                  tipoActivo === indice.tipo
                    ? styles["analisis__tipoBtn--active"]
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleChangeTipo(indice.tipo)}
                disabled={isLoading}
              >
                {indice.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {(historial.length > 0 || isLoadingHistory) && (
        <div className={styles.analisis__history}>
          <label className={styles.analisis__history__label}>
            Análisis anteriores
          </label>
          <select
            className={styles.analisis__history__select}
            value={selectedAnalisis?._id ?? ""}
            onChange={(e) => {
              const found = historial.find((a) => a._id === e.target.value);
              if (found) handleSelectAnalisis(found);
            }}
            disabled={isLoadingHistory || isLoading}
          >
            {isLoadingHistory ? (
              <option>Cargando…</option>
            ) : (
              <>
                <option value="" disabled>
                  Selecciona un análisis
                </option>
                {historial.map((a) => (
                  <option key={a._id} value={a._id}>
                    {formatAnalisisLabel(a)}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )}

      <div className={styles.analisis__controls}>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          disabled={isLoading}
        />
        <Button
          onClick={handleAnalyse}
          loading={isLoading}
          disabled={isLoading}
        >
          Analizar {indiceActivo?.label ?? tipoActivo.toUpperCase()}
        </Button>
      </div>

      {error && (
        <p className={styles.analisis__error} role="alert">
          {error}
        </p>
      )}

      <AnalisisMap parcel={mapParcel} analisis={mapAnalisis} />
      {indiceActivo && <AnalisisLegend indice={indiceActivo} />}

      {(analisisResult ?? selectedAnalisis) && (
        <div className={styles.analisis__results}>
          {analisisResult && (
            <AnalisisMetadataCard metadata={analisisResult.metadata} />
          )}

          {displayWeather && (
            <section className={styles.weather}>
              <h3 className={styles.weather__title}>Clima del período</h3>
              <div className={styles.weather__grid}>
                {[
                  {
                    label: "Temp. máx. media",
                    value: `${displayWeather.stats.tempMaxAvg}°C`,
                  },
                  {
                    label: "Temp. mín. media",
                    value: `${displayWeather.stats.tempMinAvg}°C`,
                  },
                  {
                    label: "Precipitación total",
                    value: `${displayWeather.stats.totalPrecipitation} mm`,
                  },
                  {
                    label: "Días de lluvia",
                    value: `${displayWeather.stats.rainyDays} días`,
                  },
                ].map((stat) => (
                  <div key={stat.label} className={styles.weather__item}>
                    <span className={styles.weather__label}>{stat.label}</span>
                    <span className={styles.weather__value}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {displayTimeSeries && indiceActivo && (
            <AnalisisChart
              points={displayTimeSeries.points}
              indice={indiceActivo}
            />
          )}
        </div>
      )}
    </section>
  );
};
