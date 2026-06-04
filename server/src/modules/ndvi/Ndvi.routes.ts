import type { FastifyInstance, FastifyReply } from "fastify";
import { NDVI_ROUTE_PREFIX } from "./Ndvi.config.js";
import { NdviController } from "./Ndvi.controller.js";
import { NoImagesFoundError } from "./Ndvi.service.js";
import type {
  AnalyseNdviRequest,
  GetNdviTimeSeriesRequest,
} from "./Ndvi.interface.js";

export default function NdviRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.post(
    `${NDVI_ROUTE_PREFIX}/analyse`,
    async (request: AnalyseNdviRequest, reply: FastifyReply) => {
      try {
        return await NdviController.analyse(request, reply);
      } catch (error) {
        if (error instanceof NoImagesFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.get(
    `${NDVI_ROUTE_PREFIX}/timeseries`,
    async (request: GetNdviTimeSeriesRequest, reply: FastifyReply) => {
      try {
        return await NdviController.getTimeSeries(request, reply);
      } catch (error) {
        throw error;
      }
    },
  );

  done();
}
