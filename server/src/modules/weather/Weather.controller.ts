import type { FastifyReply } from "fastify";
import type { GetWeatherRequest } from "./Weather.interface.js";
import { WeatherService } from "./Weather.service.js";

const getWeather = async (request: GetWeatherRequest, reply: FastifyReply) => {
  const result = await WeatherService.getWeather(request.query);
  return reply.send(result);
};

export const WeatherController = { getWeather };
