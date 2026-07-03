import type { FastifyInstance, FastifyReply } from "fastify";
import { ANALISIS_ROUTE_PREFIX } from "./Analisis.config.js";
import { AnalisisController } from "./Analisis.controller.js";
import { NoImagesFoundError } from "./Analisis.service.js";
import { AnalisisNotFoundError } from "./Analisis.interface.js";
import { authenticate } from "../../middleware/Auth.middleware.js";
import type {
  AnalyseRequest,
  GetTimeSeriesRequest,
  CreateAnalisisRequest,
  GetAnalisisRequest,
  DeleteAnalisisRequest,
} from "./Analisis.interface.js";
import { UsageLimitExceededError } from "../usageLimits/UsageLimits.interface.js";

export default function AnalisisRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.addHook("onRequest", authenticate);

  // ─── Cálculo ────────────────────────────────────────────────────

  fastify.post(
    `${ANALISIS_ROUTE_PREFIX}/process`,
    async (request: AnalyseRequest, reply: FastifyReply) => {
      try {
        return await AnalisisController.analyse(request, reply);
      } catch (error) {
        if (error instanceof NoImagesFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof UsageLimitExceededError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.get(
    `${ANALISIS_ROUTE_PREFIX}/timeseries`,
    async (request: GetTimeSeriesRequest, reply: FastifyReply) => {
      try {
        return await AnalisisController.getTimeSeries(request, reply);
      } catch (error) {
        if (error instanceof NoImagesFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.get(
    `${ANALISIS_ROUTE_PREFIX}/indices`,
    async (request, reply: FastifyReply) => {
      return AnalisisController.getIndices(request, reply);
    },
  );

  // ─── Persistencia ───────────────────────────────────────────────

  fastify.post(
    ANALISIS_ROUTE_PREFIX,
    async (request: CreateAnalisisRequest, reply: FastifyReply) => {
      return AnalisisController.create(request, reply);
    },
  );

  fastify.get(
    ANALISIS_ROUTE_PREFIX,
    async (request: GetAnalisisRequest, reply: FastifyReply) => {
      return AnalisisController.getByParcela(request, reply);
    },
  );

  fastify.delete(
    `${ANALISIS_ROUTE_PREFIX}/:id`,
    async (request: DeleteAnalisisRequest, reply: FastifyReply) => {
      try {
        return await AnalisisController.remove(request, reply);
      } catch (error) {
        if (error instanceof AnalisisNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  done();
}
