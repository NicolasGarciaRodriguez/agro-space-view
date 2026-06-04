"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { StacRepository } from "@agrospace/shared/repositories/Stac.repository";
import { NdviRepository } from "@agrospace/shared/repositories/Ndvi.repository";
import { CatastroRepository } from "@agrospace/shared/repositories/Catastro.repository";
import { WeatherRepository } from "@agrospace/shared/repositories/Weather.repository";
import type { NdviAnalysisResult } from "@agrospace/shared/repositories/Ndvi.repository";
import type { CadastralParcelDTO } from "@agrospace/shared/dtos/Catastro.dto";
import type { WeatherSummaryDTO } from "@agrospace/shared/dtos/Weather.dto";
import type { NdviTimeSeriesResponseDTO } from "@agrospace/shared/dtos/Ndvi.dto";
import { NdviMetadataCard } from "@/components/ndviMetaCard/NdviMetaCard.component";
import { NdviChart } from "@/components/ndviChart/NdviChart.component";
import { DateRangePicker } from "@/components/dateRangePicker/DateRangePicker.component";
import type { DateRangeValue } from "@/components/dateRangePicker/DateRangePicker.component";
import { isHttpError } from "@/lib/http-error";
import {
  DEFAULT_DATE_RANGE,
  MIN_CATASTRO_REF_LENGTH,
  STAC_DEMO_SEARCH,
} from "./HomePage.config";
import styles from "./HomePage.module.scss";

const NdviMap = dynamic(
  () => import("@/components/ndviMap/NdviMap.component").then((m) => m.NdviMap),
  {
    ssr: false,
    loading: () => (
      <div className={styles["map-loading"]} role="status" aria-live="polite">
        Cargando mapa…
      </div>
    ),
  },
);

function getErrorMessage(err: unknown, fallback: string): string {
  return isHttpError(err) ? (err.message ?? fallback) : fallback;
}

export const MainHomeComponent = () => {
  const [isLoadingStac, setIsLoadingStac] = useState(false);
  const [isLoadingNdvi, setIsLoadingNdvi] = useState(false);
  const [isLoadingParcel, setIsLoadingParcel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stacResult, setStacResult] = useState<unknown>(null);
  const [catastroRef, setCatastroRef] = useState("");
  const [parcel, setParcel] = useState<CadastralParcelDTO | null>(null);
  const [ndviResult, setNdviResult] = useState<NdviAnalysisResult | null>(null);
  const [weatherResult, setWeatherResult] = useState<WeatherSummaryDTO | null>(
    null,
  );
  const [timeSeriesResult, setTimeSeriesResult] =
    useState<NdviTimeSeriesResponseDTO | null>(null);
  const [dateRange, setDateRange] =
    useState<DateRangeValue>(DEFAULT_DATE_RANGE);

  const isBusy = isLoadingStac || isLoadingNdvi || isLoadingParcel;
  const canSearchParcel = catastroRef.trim().length >= MIN_CATASTRO_REF_LENGTH;

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    return () => {
      if (ndviResult?.imageUrl) {
        URL.revokeObjectURL(ndviResult.imageUrl);
      }
    };
  }, [ndviResult?.imageUrl]);

  const handleSearchImages = async () => {
    setIsLoadingStac(true);
    clearError();
    try {
      const data = await StacRepository.searchImages(STAC_DEMO_SEARCH);
      setStacResult(data);
    } catch (err) {
      setStacResult(null);
      setError(getErrorMessage(err, "No se pudieron obtener las imágenes."));
    } finally {
      setIsLoadingStac(false);
    }
  };

  const handleGetParcel = async () => {
    if (!canSearchParcel) return;

    setIsLoadingParcel(true);
    clearError();
    setNdviResult(null);
    setWeatherResult(null);
    setTimeSeriesResult(null);

    try {
      const ref = catastroRef.trim().slice(0, 20);
      const data = await CatastroRepository.getParcelByRef({ ref });
      setParcel(data);
    } catch (err) {
      setParcel(null);
      setError(getErrorMessage(err, "No se pudo obtener la parcela."));
    } finally {
      setIsLoadingParcel(false);
    }
  };

  const handleAnalyseNdvi = async () => {
    if (!parcel) return;

    setIsLoadingNdvi(true);
    clearError();

    if (ndviResult?.imageUrl) {
      URL.revokeObjectURL(ndviResult.imageUrl);
    }

    try {
      const [ndvi, weather, timeSeries] = await Promise.all([
        NdviRepository.analyseNdvi({
          bbox: parcel.bbox,
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
          maxCloud: 20,
        }),
        WeatherRepository.getWeather({
          lat: parcel.center[1],
          lon: parcel.center[0],
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
        }),
        NdviRepository.getTimeSeries({
          bbox: parcel.bbox,
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
          maxCloud: 20,
        }),
      ]);

      setNdviResult(ndvi);
      setWeatherResult(weather);
      setTimeSeriesResult(timeSeries);
    } catch (err) {
      setNdviResult(null);
      setWeatherResult(null);
      setTimeSeriesResult(null);
      setError(getErrorMessage(err, "No se pudo analizar el NDVI."));
    } finally {
      setIsLoadingNdvi(false);
    }
  };

  return (
    <main className={styles.home}>
      <div className={styles.home__container}>
        <header className={styles.home__header}>
          <h1 className={styles.home__title}>AgroSpace</h1>
          <p className={styles.home__subtitle}>
            Consulta parcelas catastrales y analiza el NDVI sobre imágenes
            Sentinel-2 en la zona de Sevilla.
          </p>
        </header>

        <div className={styles.home__panels}>
          <section
            className={styles.panel}
            aria-labelledby="panel-catastro-title"
          >
            <h2 id="panel-catastro-title" className={styles.panel__title}>
              Parcela catastral
            </h2>
            <div className={styles.panel__body}>
              <div className={styles.field}>
                <input
                  id="catastro-ref"
                  type="text"
                  className={styles.field__input}
                  value={catastroRef}
                  onChange={(e) => setCatastroRef(e.target.value)}
                  placeholder="Referencia catastral (14–20 caracteres)"
                  maxLength={20}
                  disabled={isBusy}
                  aria-describedby="catastro-ref-hint"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button
                type="button"
                className={`${styles.button} ${styles["button--amber"]}`}
                onClick={handleGetParcel}
                disabled={isBusy || !canSearchParcel}
              >
                {isLoadingParcel ? "Buscando…" : "Buscar parcela"}
              </button>
            </div>
            <p id="catastro-ref-hint" className={styles.panel__hint}>
              Introduce al menos {MIN_CATASTRO_REF_LENGTH} caracteres de la
              referencia catastral.
            </p>
          </section>

          <section className={styles.panel} aria-labelledby="panel-ndvi-title">
            <h2 id="panel-ndvi-title" className={styles.panel__title}>
              Análisis NDVI
            </h2>
            <div className={styles.panel__body}>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                disabled={isBusy}
              />
              <button
                type="button"
                className={`${styles.button} ${styles["button--emerald"]}`}
                onClick={handleAnalyseNdvi}
                disabled={isBusy || !parcel}
                title={
                  !parcel ? "Primero busca una parcela catastral" : undefined
                }
              >
                {isLoadingNdvi ? "Analizando…" : "Analizar NDVI"}
              </button>
            </div>
            {!parcel && (
              <p className={styles.panel__hint}>
                Busca una parcela para habilitar el análisis.
              </p>
            )}
          </section>

          <section
            className={`${styles.panel} ${styles["panel--stac"]}`}
            aria-labelledby="panel-stac-title"
          >
            <h2 id="panel-stac-title" className={styles.panel__title}>
              Catálogo STAC
            </h2>
            <div className={styles.panel__body}>
              <button
                type="button"
                className={`${styles.button} ${styles["button--sky"]}`}
                onClick={handleSearchImages}
                disabled={isBusy}
              >
                {isLoadingStac ? "Buscando…" : "Buscar imágenes STAC"}
              </button>
            </div>
          </section>
        </div>

        {error && (
          <p role="alert" className={styles.home__alert}>
            {error}
          </p>
        )}

        {stacResult !== null && (
          <details className={styles["stac-output"]}>
            <summary className={styles["stac-output__summary"]}>
              Resultado STAC (JSON)
            </summary>
            <pre className={styles["stac-output__pre"]}>
              {JSON.stringify(stacResult, null, 2)}
            </pre>
          </details>
        )}

        {parcel !== null && (
          <div className={styles.home__results}>
            <NdviMap parcel={parcel} ndvi={ndviResult ?? undefined} />
            {ndviResult && <NdviMetadataCard metadata={ndviResult.metadata} />}
            {weatherResult && (
              <section
                className={styles.weather_stats}
                aria-labelledby="weather-stats-title"
              >
                <h3
                  id="weather-stats-title"
                  className={styles.weather_stats__title}
                >
                  Clima del período
                </h3>
                <div className={styles.weather_stats__grid}>
                  <div className={styles.weather_stats__item}>
                    <span className={styles.weather_stats__label}>
                      Temp. máx. media
                    </span>
                    <span className={styles.weather_stats__value}>
                      {weatherResult.stats.tempMaxAvg}°C
                    </span>
                  </div>
                  <div className={styles.weather_stats__item}>
                    <span className={styles.weather_stats__label}>
                      Temp. mín. media
                    </span>
                    <span className={styles.weather_stats__value}>
                      {weatherResult.stats.tempMinAvg}°C
                    </span>
                  </div>
                  <div className={styles.weather_stats__item}>
                    <span className={styles.weather_stats__label}>
                      Precipitación total
                    </span>
                    <span className={styles.weather_stats__value}>
                      {weatherResult.stats.totalPrecipitation} mm
                    </span>
                  </div>
                  <div className={styles.weather_stats__item}>
                    <span className={styles.weather_stats__label}>
                      Días de lluvia
                    </span>
                    <span className={styles.weather_stats__value}>
                      {weatherResult.stats.rainyDays} días
                    </span>
                  </div>
                </div>
              </section>
            )}
            {timeSeriesResult && <NdviChart points={timeSeriesResult.points} />}
          </div>
        )}
      </div>
    </main>
  );
};
