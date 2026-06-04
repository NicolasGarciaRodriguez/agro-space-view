import type { FastifyRequest } from "fastify";

export interface GetWeatherQuery {
  lat: number;
  lon: number;
  dateFrom: string;
  dateTo: string;
}

export type GetWeatherRequest = FastifyRequest<{
  Querystring: GetWeatherQuery;
}>;

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_sum: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
}

export interface WeatherSummary {
  days: WeatherDay[];
  stats: {
    tempMaxAvg: number;
    tempMinAvg: number;
    totalPrecipitation: number;
    rainyDays: number;
  };
}
