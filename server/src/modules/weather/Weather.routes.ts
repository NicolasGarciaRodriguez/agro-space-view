import type { FastifyInstance, FastifyReply } from "fastify";
import { WEATHER_ROUTE_PREFIX } from "./Weather.config.js";
import { WeatherController } from "./Weather.controller.js";
import type { GetWeatherRequest } from "./Weather.interface.js";

export default function WeatherRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.get(
    `${WEATHER_ROUTE_PREFIX}`,
    async (request: GetWeatherRequest, reply: FastifyReply) => {
      try {
        return await WeatherController.getWeather(request, reply);
      } catch (error) {
        throw error;
      }
    },
  );

  done();
}
