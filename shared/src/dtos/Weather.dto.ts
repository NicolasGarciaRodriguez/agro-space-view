export interface GetWeatherDTO {
  lat: number;
  lon: number;
  dateFrom: string;
  dateTo: string;
}

export interface WeatherDayDTO {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
}

export interface WeatherStatsDTO {
  tempMaxAvg: number;
  tempMinAvg: number;
  totalPrecipitation: number;
  rainyDays: number;
}

export interface WeatherSummaryDTO {
  days: WeatherDayDTO[];
  stats: WeatherStatsDTO;
}
