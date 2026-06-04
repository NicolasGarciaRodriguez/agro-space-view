import type { FastifyReply } from "fastify";
import type {
  AnalyseNdviRequest,
  GetNdviTimeSeriesRequest,
} from "./Ndvi.interface.js";
import { NdviService } from "./Ndvi.service.js";

const analyse = async (
  request: AnalyseNdviRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { image, metadata } = await NdviService.analyse(request.body);

  reply.header("Content-Type", "image/png");
  reply.header("Cache-Control", "public, max-age=3600");
  reply.header("X-Ndvi-Image-Id", metadata.usedImageId);
  reply.header("X-Ndvi-Image-Date", metadata.usedImageDate);
  reply.header("X-Ndvi-Cloud-Cover", String(metadata.cloudCover));

  return reply.send(image);
};

const getTimeSeries = async (
  request: GetNdviTimeSeriesRequest,
  reply: FastifyReply,
) => {
  const result = await NdviService.getTimeSeries(request.query);
  return reply.send(result);
};

export const NdviController = { analyse, getTimeSeries };
