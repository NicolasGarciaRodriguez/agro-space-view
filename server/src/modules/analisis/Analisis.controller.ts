import type { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { AnalisisModel } from "../../schemas/Analisis.schema.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";
import { S3Service } from "../../services/S3.service.js";
import { AnalisisService } from "./Analisis.service.js";
import { INDICES } from "./Analisis.config.js";
import {
  AnalisisNotFoundError,
  AnalisisForbiddenError,
  type AnalyseRequest,
  type GetTimeSeriesRequest,
  type CreateAnalisisRequest,
  type GetAnalisisRequest,
  type DeleteAnalisisRequest,
} from "./Analisis.interface.js";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import { InsightsService } from "../insights/Insights.service.js";
import { UsageLimitsService } from "../usageLimits/UsageLimits.service.js";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { ExplotacionAccessService } from "../../services/explotacionAccess/ExplotacionAccess.service.js";
import {
  ExplotacionAccessDeniedError,
  ExplotacionNotFoundForAccessError,
} from "../../services/explotacionAccess/ExplotacionAccess.interface.js";

const isValidTipo = (tipo: string): tipo is IndiceTipo =>
  Object.values(IndiceTipo).includes(tipo as IndiceTipo);

const translateAccessError = (error: unknown): never => {
  if (error instanceof ExplotacionNotFoundForAccessError) {
    throw new AnalisisNotFoundError();
  }
  if (error instanceof ExplotacionAccessDeniedError) {
    throw new AnalisisForbiddenError();
  }
  throw error;
};

// Resuelve la explotación dueña de una parcela — necesario en los
// endpoints que solo reciben parcelaId, no explotacionId, para poder
// comprobar el acceso a nivel de explotación.
const getExplotacionIdFromParcela = async (
  parcelaId: string,
): Promise<string> => {
  if (!mongoose.isValidObjectId(parcelaId)) throw new AnalisisNotFoundError();
  const parcela = await ParcelaModel.findById(parcelaId, {
    explotacionId: 1,
  }).lean();
  if (!parcela) throw new AnalisisNotFoundError();
  return parcela.explotacionId.toString();
};

// ═══════════════════════════════════════════════════════════════════
//  CÁLCULO (Sentinel Hub)
// ═══════════════════════════════════════════════════════════════════

const analyse = async (
  request: AnalyseRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { userId } = request.user;
  const { tipo, explotacionId } = request.body;

  if (!isValidTipo(tipo)) {
    return reply.status(400).send({ error: `Índice no soportado: ${tipo}` });
  }

  let explotacion;
  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      explotacionId,
      NivelAcceso.GESTION,
    );
    explotacion = await ExplotacionModel.findById(explotacionId).lean();
  } catch (error) {
    translateAccessError(error);
  }
  if (!explotacion) throw new AnalisisNotFoundError();

  await UsageLimitsService.assertCanAnalyse(explotacion.userId.toString(), tipo);

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

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      explotacionId,
      NivelAcceso.GESTION,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const imageBuffer = Buffer.from(imageBase64, "base64");
  const key = S3Service.generateKey(tipo, parcelaId, dateFrom, dateTo);
  const { url: imageUrl } = await S3Service.uploadBuffer(imageBuffer, key);

  const analisis = await AnalisisModel.create({
    userId, // quién lo generó, a efectos de auditoría
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

  InsightsService.maybeGenerateParcelaInsight(
    userId,
    explotacionId,
    parcelaId,
  ).catch(() => {});

  return reply.status(201).send(analisis);
};

const getByParcela = async (
  request: GetAnalisisRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { parcelaId, tipo, limit = 10 } = request.query;

  const explotacionId = await getExplotacionIdFromParcela(parcelaId);
  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      explotacionId,
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const filter: Record<string, unknown> = { parcelaId };
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

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      analisis.explotacionId.toString(),
      NivelAcceso.GESTION,
    );
  } catch (error) {
    translateAccessError(error);
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