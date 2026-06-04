import type { FastifyInstance, FastifyReply } from "fastify";
import { StacController } from "./Stac.controller.js";
import type { SearchImagesRequest } from "./Stac.interface.js";
import { STAC_ROUTE_PREFIX } from "./Stac.config.js";

export default function StacRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
) {
  fastify.get(
    `${STAC_ROUTE_PREFIX}/images`,
    async (request: SearchImagesRequest, reply: FastifyReply) => {
      return StacController.searchImages(request, reply);
    },
  );

  done();
}
