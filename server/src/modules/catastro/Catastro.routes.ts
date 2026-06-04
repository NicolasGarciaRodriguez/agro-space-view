import type { FastifyInstance, FastifyReply } from "fastify";
import { CATASTRO_ROUTE_PREFIX } from "./Catastro.config.js";
import { CatastroController } from "./Catastro.controller.js";
import {
  CatastroNotFoundError,
  CatastroParseError,
} from "./Catastro.interface.js";
import type {
  GetParcelByRefRequest,
  GetParcelByCoordsRequest,
} from "./Catastro.interface.js";

export default function CatastroRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.get(
    `${CATASTRO_ROUTE_PREFIX}/parcel`,
    async (request: GetParcelByRefRequest, reply: FastifyReply) => {
      try {
        return await CatastroController.getParcelByRef(request, reply);
      } catch (error) {
        if (error instanceof CatastroNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof CatastroParseError) {
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.get(
    `${CATASTRO_ROUTE_PREFIX}/parcel/coords`,
    async (request: GetParcelByCoordsRequest, reply: FastifyReply) => {
      try {
        return await CatastroController.getParcelByCoords(request, reply);
      } catch (error) {
        if (error instanceof CatastroNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof CatastroParseError) {
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  done();
}
