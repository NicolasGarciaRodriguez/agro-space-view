"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { NdviRepository } from "@agrospace/shared/repositories/Ndvi.repository";
import { WeatherRepository } from "@agrospace/shared/repositories/Weather.repository";
import { AnalisisNdviRepository } from "@agrospace/shared/repositories/AnalisisNdvi.repository";
import { NdviMetadataCard } from "@/components/ndviMetaCard/NdviMetaCard.component";
import { NdviChart } from "@/components/ndviChart/NdviChart.component";
import { DateRangePicker } from "@/components/dateRangePicker/DateRangePicker.component";
import { Button } from "@/components/button/Button.component";
import { isHttpError } from "@/lib/http-error";
import type { DateRangeValue } from "@/components/dateRangePicker/DateRangePicker.component";
import type { NdviAnalysisResult } from "@agrospace/shared/repositories/Ndvi.repository";
import type { WeatherSummaryDTO } from "@agrospace/shared/dtos/Weather.dto";
import type { NdviTimeSeriesResponseDTO } from "@agrospace/shared/dtos/Ndvi.dto";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import type { AnalisisNdviDTO } from "@agrospace/shared/dtos/AnalisisNdvi.dto";
import { DEFAULT_DATE_RANGE } from "./ParcelaNdvi.config";
import styles from "./PacrelaNdvi.module.scss";
import { NdviLegend } from "@/components/ndviMap/components/ndviLegend/NdviLegend.component";

const NdviMap = dynamic(
  () => import("@/components/ndviMap/NdviMap.component").then((m) => m.NdviMap),
  {
    ssr: false,
    loading: () => (
      <div className={styles.ndvi__mapLoading}>Cargando mapa…</div>
    ),
  },
);

interface ParcelaNdviProps {
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

const formatAnalisisLabel = (analisis: AnalisisNdviDTO): string => {
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
  return `${from} → ${to} — NDVI ${analisis.ndviMedio.toFixed(3)}`;
};

export const ParcelaNdvi = ({ parcela }: ParcelaNdviProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] =
    useState<DateRangeValue>(DEFAULT_DATE_RANGE);
  const [ndviResult, setNdviResult] = useState<NdviAnalysisResult | null>(null);
  const [weatherResult, setWeatherResult] = useState<WeatherSummaryDTO | null>(
    null,
  );
  const [timeSeriesResult, setTimeSeriesResult] =
    useState<NdviTimeSeriesResponseDTO | null>(null);
  const [historial, setHistorial] = useState<AnalisisNdviDTO[]>([]);
  const [selectedAnalisis, setSelectedAnalisis] =
    useState<AnalisisNdviDTO | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const loadHistorial = async () => {
      setIsLoadingHistory(true);
      try {
        const data = await AnalisisNdviRepository.getByParcela(parcela._id);
        setHistorial(data);

        if (data.length > 0) {
          setSelectedAnalisis(data[0]);
        }
      } catch {
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistorial();
  }, [parcela._id]);

  useEffect(() => {
    return () => {
      if (ndviResult?.imageUrl) URL.revokeObjectURL(ndviResult.imageUrl);
    };
  }, [ndviResult?.imageUrl]);

  useEffect(() => {
    setNdviResult(null);
    setWeatherResult(null);
    setTimeSeriesResult(null);
    setSelectedAnalisis(null);
    setHistorial([]);
    clearError();
  }, [parcela._id]);

  const handleSelectAnalisis = (analisis: AnalisisNdviDTO) => {
    setSelectedAnalisis(analisis);
    if (ndviResult?.imageUrl) URL.revokeObjectURL(ndviResult.imageUrl);
    setNdviResult(null);
    setWeatherResult(null);
    setTimeSeriesResult(null);
  };

  const handleAnalyse = async () => {
    setIsLoading(true);
    clearError();
    setSelectedAnalisis(null);

    if (ndviResult?.imageUrl) URL.revokeObjectURL(ndviResult.imageUrl);

    try {
      const [ndvi, weather, timeSeries] = await Promise.all([
        NdviRepository.analyseNdvi({
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
        NdviRepository.getTimeSeries({
          bbox: parcela.bbox,
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
          maxCloud: 20,
        }),
      ]);

      setNdviResult(ndvi);
      setWeatherResult(weather);
      setTimeSeriesResult(timeSeries);

      AnalisisNdviRepository.create({
        parcelaId: parcela._id,
        explotacionId: parcela.explotacionId,
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
        ndviMedio:
          timeSeries.points.length > 0
            ? Math.round(
                (timeSeries.points.reduce((a, b) => a + b.mean, 0) /
                  timeSeries.points.length) *
                  1000,
              ) / 1000
            : 0,
        cloudCover: ndvi.metadata.cloudCover,
        usedImageId: ndvi.metadata.usedImageId,
        usedImageDate: ndvi.metadata.usedImageDate,
        imageBase64: ndvi.imageBase64,
        clima: weather.stats,
        timeSeries: timeSeries.points,
      })
        .then((saved) => {
          setHistorial((prev) => [saved, ...prev]);
        })
        .catch(() => {});
    } catch (err) {
      setNdviResult(null);
      setWeatherResult(null);
      setTimeSeriesResult(null);
      setError(getErrorMessage(err, "No se pudo analizar el NDVI."));
    } finally {
      setIsLoading(false);
    }
  };

  const mapParcel = toMapParcel(parcela);

  const mapNdvi = ndviResult
    ? { imageUrl: ndviResult.imageUrl, metadata: ndviResult.metadata }
    : selectedAnalisis
      ? {
          imageUrl: selectedAnalisis.imageUrl,
          metadata: {
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
    <section className={styles.ndvi}>
      <h2 className={styles.ndvi__title}>Análisis NDVI</h2>

      {(historial.length > 0 || isLoadingHistory) && (
        <div className={styles.ndvi__history}>
          <label className={styles.ndvi__history__label}>
            Análisis anteriores
          </label>
          <select
            className={styles.ndvi__history__select}
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

      <div className={styles.ndvi__controls}>
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
          Analizar NDVI
        </Button>
      </div>

      {error && (
        <p className={styles.ndvi__error} role="alert">
          {error}
        </p>
      )}

      <NdviMap parcel={mapParcel} ndvi={mapNdvi} />
      <NdviLegend />

      {(ndviResult ?? selectedAnalisis) && (
        <div className={styles.ndvi__results}>
          {ndviResult && <NdviMetadataCard metadata={ndviResult.metadata} />}

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

          {displayTimeSeries && <NdviChart points={displayTimeSeries.points} />}
        </div>
      )}
    </section>
  );
};
