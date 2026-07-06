import { getBaseUrl } from "../services/Http.service.js";
import HttpService from "../services/Http.service.js";
import type { GetWeatherDTO, WeatherSummaryDTO } from "../dtos/Weather.dto.js";

const BASE = () => `${getBaseUrl()}/api/weather`;

const getWeather = async (
  params: GetWeatherDTO,
): Promise<WeatherSummaryDTO> => {
  return HttpService.get(`${BASE()}`, {
    lat: params.lat,
    lon: params.lon,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  }) as Promise<WeatherSummaryDTO>;
};

export const WeatherRepository = { getWeather };
