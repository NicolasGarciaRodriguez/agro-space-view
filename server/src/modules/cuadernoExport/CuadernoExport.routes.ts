import type { FastifyInstance, FastifyReply } from "fastify";
import { CUADERNO_EXPORT_ROUTE_PREFIX } from "./CuadernoExport.config.js";
import { CuadernoExportController } from "./CuadernoExport.controller.js";
import { ExportForbiddenError } from "./CuadernoExport.interface.js";
import { authenticate } from "../../middleware/Auth.middleware.js";
import type {
  ExportParcelaRequest,
  ExportExplotacionRequest,
} from "./CuadernoExport.interface.js";

export default function CuadernoExportRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.addHook("onRequest", authenticate);

  fastify.get(
    `${CUADERNO_EXPORT_ROUTE_PREFIX}/parcela/:parcelaId`,
    async (request: ExportParcelaRequest, reply: FastifyReply) => {
      try {
        return await CuadernoExportController.exportParcela(request, reply);
      } catch (error) {
        if (error instanceof ExportForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.get(
    `${CUADERNO_EXPORT_ROUTE_PREFIX}/explotacion/:explotacionId`,
    async (request: ExportExplotacionRequest, reply: FastifyReply) => {
      try {
        return await CuadernoExportController.exportExplotacion(request, reply);
      } catch (error) {
        if (error instanceof ExportForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  done();
}