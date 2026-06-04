import type { FastifyInstance, FastifyReply } from "fastify";
import { ANALISIS_NDVI_ROUTE_PREFIX } from "./AnalisisNdvi.config.js";
import { AnalisisNdviController } from "./AnalisisNdvi.controller.js";
import { AnalisisNdviNotFoundError } from "./AnalisisNdvi.interface.js";
import { authenticate } from "../../middleware/Auth.middleware.js";
import type {
  CreateAnalisisNdviRequest,
  GetAnalisisNdviRequest,
  DeleteAnalisisNdviRequest,
} from "./AnalisisNdvi.interface.js";

export default function AnalisisNdviRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.addHook("onRequest", authenticate);

  fastify.post(
    ANALISIS_NDVI_ROUTE_PREFIX,
    async (request: CreateAnalisisNdviRequest, reply: FastifyReply) => {
      return AnalisisNdviController.create(request, reply);
    },
  );

  fastify.get(
    ANALISIS_NDVI_ROUTE_PREFIX,
    async (request: GetAnalisisNdviRequest, reply: FastifyReply) => {
      return AnalisisNdviController.getByParcela(request, reply);
    },
  );

  fastify.delete(
    `${ANALISIS_NDVI_ROUTE_PREFIX}/:id`,
    async (request: DeleteAnalisisNdviRequest, reply: FastifyReply) => {
      try {
        return await AnalisisNdviController.remove(request, reply);
      } catch (error) {
        if (error instanceof AnalisisNdviNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  done();
}
