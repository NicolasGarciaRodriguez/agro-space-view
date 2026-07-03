import config from "../config/index.config.js";
import HttpService from "../services/Http.service.js";
import type { GetWeatherDTO, WeatherSummaryDTO } from "../dtos/Weather.dto.js";

const getWeather = async (
  params: GetWeatherDTO,
): Promise<WeatherSummaryDTO> => {
  return HttpService.get(`${config.API_URL}/api/weather`, {
    lat: params.lat,
    lon: params.lon,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  }) as Promise<WeatherSummaryDTO>;
};

export const WeatherRepository = { getWeather };
