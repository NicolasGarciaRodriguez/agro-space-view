import type { FastifyReply } from "fastify";
import {
  type GetParcelByRefRequest,
  type GetParcelByCoordsRequest,
} from "./Catastro.interface.js";
import { CatastroService } from "./Catastro.service.js";

const getParcelByRef = async (
  request: GetParcelByRefRequest,
  reply: FastifyReply,
) => {
  const parcel = await CatastroService.getParcelByRef(request.query);
  return reply.send(parcel);
};

const getParcelByCoords = async (
  request: GetParcelByCoordsRequest,
  reply: FastifyReply,
) => {
  const parcel = await CatastroService.getParcelByCoords(request.query);
  return reply.send(parcel);
};

export const CatastroController = {
  getParcelByRef,
  getParcelByCoords,
};
