export const WEATHER_ROUTE_PREFIX = "/api/weather" as const;

export const OPEN_METEO_CONFIG = {
  archiveUrl: "https://archive-api.open-meteo.com/v1/archive",
  forecastUrl: "https://api.open-meteo.com/v1/forecast",
  timezone: "Europe/Madrid",
  variables: [
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_sum",
  ].join(","),
} as const;
