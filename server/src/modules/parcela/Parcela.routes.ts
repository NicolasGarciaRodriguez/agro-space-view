import type { FastifyInstance, FastifyReply } from "fastify";
import { PARCELA_ROUTE_PREFIX } from "./Parcela.config.js";
import { ParcelaController } from "./Parcela.controller.js";
import {
  ParcelaNotFoundError,
  ParcelaForbiddenError,
  ParcelaAlreadyExistsError,
  type CreateParcelaRequest,
  type GetParcelasRequest,
  type GetParcelaRequest,
  type UpdateParcelaRequest,
  type DeleteParcelaRequest,
} from "./Parcela.interface.js";
import { authenticate } from "../../middleware/Auth.middleware.js";
import { UsageLimitExceededError } from "../usageLimits/UsageLimits.interface.js";

const PREFIX = `${PARCELA_ROUTE_PREFIX}/:explotacionId/parcelas`;

const handleParcelaErrors = (error: unknown, reply: FastifyReply) => {
  if (error instanceof ParcelaNotFoundError) {
    return reply.status(404).send({ error: error.message });
  }
  if (error instanceof ParcelaForbiddenError) {
    return reply.status(403).send({ error: error.message });
  }
  if (error instanceof ParcelaAlreadyExistsError) {
    return reply.status(409).send({ error: error.message });
  }
  throw error;
};

export default function ParcelaRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.addHook("onRequest", authenticate);

  fastify.get(
    PREFIX,
    async (request: GetParcelasRequest, reply: FastifyReply) => {
      try {
        return await ParcelaController.getAll(request, reply);
      } catch (error) {
        return handleParcelaErrors(error, reply);
      }
    },
  );

  fastify.get(
    `${PREFIX}/:id`,
    async (request: GetParcelaRequest, reply: FastifyReply) => {
      try {
        return await ParcelaController.getById(request, reply);
      } catch (error) {
        return handleParcelaErrors(error, reply);
      }
    },
  );

  fastify.post(
    PREFIX,
    async (request: CreateParcelaRequest, reply: FastifyReply) => {
      try {
        return await ParcelaController.create(request, reply);
      } catch (error) {
        if (error instanceof ParcelaAlreadyExistsError) {
          return reply.status(409).send({ error: error.message });
        }
        if (error instanceof UsageLimitExceededError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.patch(
    `${PREFIX}/:id`,
    async (request: UpdateParcelaRequest, reply: FastifyReply) => {
      try {
        return await ParcelaController.update(request, reply);
      } catch (error) {
        return handleParcelaErrors(error, reply);
      }
    },
  );

  fastify.delete(
    `${PREFIX}/:id`,
    async (request: DeleteParcelaRequest, reply: FastifyReply) => {
      try {
        return await ParcelaController.remove(request, reply);
      } catch (error) {
        return handleParcelaErrors(error, reply);
      }
    },
  );

  done();
}
