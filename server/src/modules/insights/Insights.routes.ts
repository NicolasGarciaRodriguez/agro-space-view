import type { FastifyInstance, FastifyReply } from "fastify";
import { INSIGHTS_ROUTE_PREFIX } from "./Insights.config.js";
import { InsightsController } from "./Insights.controller.js";
import { InsightGenerationError } from "./Insights.interface.js";
import { authenticate } from "../../middleware/Auth.middleware.js";
import type {
  GetInsightParcelaRequest,
  GetInsightExplotacionRequest,
} from "./Insights.interface.js";

export default function InsightsRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.addHook("onRequest", authenticate);

  fastify.get(
    `${INSIGHTS_ROUTE_PREFIX}/parcela/:parcelaId`,
    async (request: GetInsightParcelaRequest, reply: FastifyReply) => {
      return InsightsController.getByParcela(request, reply);
    },
  );

  fastify.get(
    `${INSIGHTS_ROUTE_PREFIX}/explotacion/:explotacionId`,
    async (request: GetInsightExplotacionRequest, reply: FastifyReply) => {
      try {
        return await InsightsController.getByExplotacion(request, reply);
      } catch (error) {
        if (error instanceof InsightGenerationError) {
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  done();
}
