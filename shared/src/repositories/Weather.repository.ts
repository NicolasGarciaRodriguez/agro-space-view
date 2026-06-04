import config from "../config/index.config";
import HttpService from "../services/Http.service";
import type { GetWeatherDTO, WeatherSummaryDTO } from "../dtos/Weather.dto";

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
