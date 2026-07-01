import type { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { AnalisisModel } from "../../schemas/Analisis.schema.js";
import { S3Service } from "../../services/S3.service.js";
import { AnalisisService } from "./Analisis.service.js";
import { INDICES } from "./Analisis.config.js";
import {
  AnalisisNotFoundError,
  type AnalyseRequest,
  type GetTimeSeriesRequest,
  type CreateAnalisisRequest,
  type GetAnalisisRequest,
  type DeleteAnalisisRequest,
} from "./Analisis.interface.js";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";

const isValidTipo = (tipo: string): tipo is IndiceTipo =>
  Object.values(IndiceTipo).includes(tipo as IndiceTipo);

// ═══════════════════════════════════════════════════════════════════
//  CÁLCULO (Sentinel Hub)
// ═══════════════════════════════════════════════════════════════════

const analyse = async (
  request: AnalyseRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { tipo } = request.body;
  if (!isValidTipo(tipo)) {
    return reply.status(400).send({ error: `Índice no soportado: ${tipo}` });
  }

  const { image, metadata } = await AnalisisService.analyse(request.body);

  reply.header("Content-Type", "image/png");
  reply.header("Cache-Control", "public, max-age=3600");
  reply.header("X-Analisis-Tipo", metadata.tipo);
  reply.header("X-Analisis-Image-Id", metadata.usedImageId);
  reply.header("X-Analisis-Image-Date", metadata.usedImageDate);
  reply.header("X-Analisis-Cloud-Cover", String(metadata.cloudCover));

  return reply.send(image);
};

const getTimeSeries = async (
  request: GetTimeSeriesRequest,
  reply: FastifyReply,
) => {
  const { tipo } = request.query;
  if (!isValidTipo(tipo)) {
    return reply.status(400).send({ error: `Índice no soportado: ${tipo}` });
  }
  const result = await AnalisisService.getTimeSeries(request.query);
  return reply.send(result);
};

const getIndices = async (_request: unknown, reply: FastifyReply) => {
  const indices = Object.values(INDICES).map((def) => ({
    tipo: def.tipo,
    label: def.label,
    descripcion: def.descripcion,
    ranges: def.ranges,
  }));
  return reply.send(indices);
};

// ═══════════════════════════════════════════════════════════════════
//  PERSISTENCIA (MongoDB + S3)
// ═══════════════════════════════════════════════════════════════════

const create = async (request: CreateAnalisisRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const {
    parcelaId,
    explotacionId,
    tipo,
    dateFrom,
    dateTo,
    indiceMedio,
    cloudCover,
    usedImageId,
    usedImageDate,
    imageBase64,
    clima,
    timeSeries,
  } = request.body;

  if (!isValidTipo(tipo)) {
    return reply.status(400).send({ error: `Índice no soportado: ${tipo}` });
  }

  const imageBuffer = Buffer.from(imageBase64, "base64");
  const key = S3Service.generateKey(tipo, parcelaId, dateFrom, dateTo);
  const { url: imageUrl } = await S3Service.uploadBuffer(imageBuffer, key);

  const analisis = await AnalisisModel.create({
    userId,
    explotacionId,
    parcelaId,
    tipo,
    dateFrom,
    dateTo,
    indiceMedio,
    cloudCover,
    usedImageId,
    usedImageDate,
    imageUrl,
    clima,
    timeSeries,
  });

  return reply.status(201).send(analisis);
};

const getByParcela = async (
  request: GetAnalisisRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { parcelaId, tipo, limit = 10 } = request.query;

  // El filtro por tipo es opcional: sin tipo devuelve todos los índices,
  // con tipo devuelve solo ese índice.
  const filter: Record<string, unknown> = { parcelaId, userId };
  if (tipo) {
    if (!isValidTipo(tipo)) {
      return reply.status(400).send({ error: `Índice no soportado: ${tipo}` });
    }
    filter.tipo = tipo;
  }

  const analisis = await AnalisisModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return reply.send(analisis);
};

const remove = async (request: DeleteAnalisisRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AnalisisNotFoundError();
  }

  const analisis = await AnalisisModel.findById(id);
  if (!analisis) throw new AnalisisNotFoundError();
  if (analisis.userId.toString() !== userId) {
    throw new AnalisisNotFoundError();
  }

  await analisis.deleteOne();
  return reply.status(204).send();
};

export const AnalisisController = {
  analyse,
  getTimeSeries,
  getIndices,
  create,
  getByParcela,
  remove,
};
