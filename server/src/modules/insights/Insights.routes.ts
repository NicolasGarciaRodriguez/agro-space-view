import type { FastifyInstance, FastifyReply } from "fastify";
import { INSIGHTS_ROUTE_PREFIX } from "./Insights.config.js";
import { InsightsController } from "./Insights.controller.js";
import {
  InsightGenerationError,
  InsightNotFoundError,
  InsightForbiddenError,
} from "./Insights.interface.js";
import { authenticate, requireVerifiedEmail } from "../../middleware/Auth.middleware.js";
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
  fastify.addHook("onRequest", requireVerifiedEmail);

  fastify.get(
    `${INSIGHTS_ROUTE_PREFIX}/parcela/:parcelaId`,
    async (request: GetInsightParcelaRequest, reply: FastifyReply) => {
      try {
        return await InsightsController.getByParcela(request, reply);
      } catch (error) {
        if (error instanceof InsightNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof InsightForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
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
        if (error instanceof InsightNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof InsightForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  done();
}