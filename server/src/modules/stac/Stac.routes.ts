import type { FastifyInstance, FastifyReply } from "fastify";
import { StacController } from "./Stac.controller.js";
import type { SearchImagesRequest } from "./Stac.interface.js";
import { STAC_ROUTE_PREFIX } from "./Stac.config.js";
import { authenticate, requireVerifiedEmail } from "../../middleware/Auth.middleware.js";

export default function StacRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
) {
  fastify.addHook("onRequest", authenticate);
  fastify.addHook("onRequest", requireVerifiedEmail);

  fastify.get(
    `${STAC_ROUTE_PREFIX}/images`,
    async (request: SearchImagesRequest, reply: FastifyReply) => {
      return StacController.searchImages(request, reply);
    },
  );

  done();
}
