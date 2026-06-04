import { OPEN_METEO_CONFIG } from "./Weather.config.js";
import type {
  GetWeatherQuery,
  OpenMeteoResponse,
  WeatherDay,
  WeatherSummary,
} from "./Weather.interface.js";

const avg = (nums: number[]): number =>
  Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;

const round = (n: number): number => Math.round(n * 10) / 10;

const getBaseUrl = (dateFrom: string): string => {
  const date = new Date(dateFrom);
  const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return daysAgo > 5
    ? OPEN_METEO_CONFIG.archiveUrl
    : OPEN_METEO_CONFIG.forecastUrl;
};

const getWeather = async (query: GetWeatherQuery): Promise<WeatherSummary> => {
  const { lat, lon, dateFrom, dateTo } = query;

  const url = new URL(getBaseUrl(dateFrom));
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("start_date", dateFrom);
  url.searchParams.set("end_date", dateTo);
  url.searchParams.set("daily", OPEN_METEO_CONFIG.variables);
  url.searchParams.set("timezone", OPEN_METEO_CONFIG.timezone);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as OpenMeteoResponse;

  const days: WeatherDay[] = data.daily.time.map((date, i) => ({
    date,
    tempMax: data.daily.temperature_2m_max[i] ?? 0,
    tempMin: data.daily.temperature_2m_min[i] ?? 0,
    precipitation: data.daily.precipitation_sum[i] ?? 0,
  }));

  const stats = {
    tempMaxAvg: avg(data.daily.temperature_2m_max),
    tempMinAvg: avg(data.daily.temperature_2m_min),
    totalPrecipitation: round(
      data.daily.precipitation_sum.reduce((a, b) => a + b, 0),
    ),
    rainyDays: data.daily.precipitation_sum.filter((p) => p > 0).length,
  };

  return { days, stats };
};

export const WeatherService = { getWeather };
