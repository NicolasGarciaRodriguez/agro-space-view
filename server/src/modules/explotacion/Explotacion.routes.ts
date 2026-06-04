import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { EXPLOTACION_ROUTE_PREFIX } from "./Explotacion.config.js";
import { ExplotacionController } from "./Explotacion.controller.js";
import {
  ExplotacionNotFoundError,
  ExplotacionForbiddenError,
  type CreateExplotacionRequest,
  type UpdateExplotacionRequest,
  type GetExplotacionRequest,
  type DeleteExplotacionRequest,
} from "./Explotacion.interface.js";
import { authenticate } from "../../middleware/Auth.middleware.js";

export default function ExplotacionRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.addHook("onRequest", authenticate);

  fastify.get(
    EXPLOTACION_ROUTE_PREFIX,
    async (request: FastifyRequest, reply: FastifyReply) => {
      return ExplotacionController.getAll(request, reply);
    },
  );

  fastify.get(
    `${EXPLOTACION_ROUTE_PREFIX}/:id`,
    async (request: GetExplotacionRequest, reply: FastifyReply) => {
      try {
        return await ExplotacionController.getById(request, reply);
      } catch (error) {
        if (error instanceof ExplotacionNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof ExplotacionForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.post(
    EXPLOTACION_ROUTE_PREFIX,
    async (request: CreateExplotacionRequest, reply: FastifyReply) => {
      return ExplotacionController.create(request, reply);
    },
  );

  fastify.patch(
    `${EXPLOTACION_ROUTE_PREFIX}/:id`,
    async (request: UpdateExplotacionRequest, reply: FastifyReply) => {
      try {
        return await ExplotacionController.update(request, reply);
      } catch (error) {
        if (error instanceof ExplotacionNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof ExplotacionForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.delete(
    `${EXPLOTACION_ROUTE_PREFIX}/:id`,
    async (request: DeleteExplotacionRequest, reply: FastifyReply) => {
      try {
        return await ExplotacionController.remove(request, reply);
      } catch (error) {
        if (error instanceof ExplotacionNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof ExplotacionForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  done();
}
