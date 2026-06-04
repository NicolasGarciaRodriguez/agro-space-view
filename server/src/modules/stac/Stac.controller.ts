import type { FastifyReply } from "fastify";
import type { SearchImagesRequest } from "./Stac.interface.js";
import { StacService } from "./Stac.service.js";

const searchImages = async (
  request: SearchImagesRequest,
  reply: FastifyReply,
) => {
  const result = await StacService.searchImages(request.query);
  return reply.send(result);
};

export const StacController = {
  searchImages,
};
