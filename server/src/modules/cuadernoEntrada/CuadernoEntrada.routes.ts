import type { FastifyInstance, FastifyReply } from "fastify";
import { CUADERNO_ROUTE_PREFIX } from "./CuadernoEntrada.config.js";
import { CuadernoEntradaController } from "./CuadernoEntrada.controller.js";
import {
  EntradaNotFoundError,
  EntradaForbiddenError,
  type CreateEntradaRequest,
  type GetEntradasRequest,
  type UpdateEntradaRequest,
  type DeleteEntradaRequest,
} from "./CuadernoEntrada.interface.js";
import { authenticate, requireVerifiedEmail } from "../../middleware/Auth.middleware.js";

const handleErrors = (error: unknown, reply: FastifyReply) => {
  if (error instanceof EntradaNotFoundError) {
    return reply.status(404).send({ error: error.message });
  }
  if (error instanceof EntradaForbiddenError) {
    return reply.status(403).send({ error: error.message });
  }
  throw error;
};

export default function CuadernoEntradaRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.addHook("onRequest", authenticate);
  fastify.addHook("onRequest", requireVerifiedEmail);

  fastify.post(
    CUADERNO_ROUTE_PREFIX,
    async (request: CreateEntradaRequest, reply: FastifyReply) => {
      return CuadernoEntradaController.create(request, reply);
    },
  );

  fastify.get(
    CUADERNO_ROUTE_PREFIX,
    async (request: GetEntradasRequest, reply: FastifyReply) => {
      return CuadernoEntradaController.getAll(request, reply);
    },
  );

  fastify.patch(
    `${CUADERNO_ROUTE_PREFIX}/:id`,
    async (request: UpdateEntradaRequest, reply: FastifyReply) => {
      try {
        return await CuadernoEntradaController.update(request, reply);
      } catch (error) {
        return handleErrors(error, reply);
      }
    },
  );

  fastify.delete(
    `${CUADERNO_ROUTE_PREFIX}/:id`,
    async (request: DeleteEntradaRequest, reply: FastifyReply) => {
      try {
        return await CuadernoEntradaController.remove(request, reply);
      } catch (error) {
        return handleErrors(error, reply);
      }
    },
  );

  done();
}
