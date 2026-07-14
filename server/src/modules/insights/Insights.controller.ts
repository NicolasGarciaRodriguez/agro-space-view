import type { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { InsightsService } from "./Insights.service.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import {
  InsightNotFoundError,
  InsightForbiddenError,
  type GetInsightParcelaRequest,
  type GetInsightExplotacionRequest,
} from "./Insights.interface.js";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { ExplotacionAccessService } from "../../services/explotacionAccess/ExplotacionAccess.service.js";
import {
  ExplotacionAccessDeniedError,
  ExplotacionNotFoundForAccessError,
} from "../../services/explotacionAccess/ExplotacionAccess.interface.js";

const translateAccessError = (error: unknown): never => {
  if (error instanceof ExplotacionNotFoundForAccessError) {
    throw new InsightNotFoundError();
  }
  if (error instanceof ExplotacionAccessDeniedError) {
    throw new InsightForbiddenError();
  }
  throw error;
};

// GET /api/insights/parcela/:parcelaId
const getByParcela = async (
  request: GetInsightParcelaRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { parcelaId } = request.params;

  if (!mongoose.isValidObjectId(parcelaId)) throw new InsightNotFoundError();

  const parcela = await ParcelaModel.findById(parcelaId, {
    explotacionId: 1,
  }).lean();
  if (!parcela) throw new InsightNotFoundError();

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      parcela.explotacionId.toString(),
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const insight = await InsightsService.getLatestParcelaInsight(parcelaId);

  if (!insight) {
    const faltantes = await InsightsService.getMissingIndices(parcelaId);
    return reply.status(404).send({
      error: "Sin insight disponible todavía",
      faltantes,
    });
  }

  return reply.send(insight);
};

// GET /api/insights/explotacion/:explotacionId
const getByExplotacion = async (
  request: GetInsightExplotacionRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { explotacionId } = request.params;

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      explotacionId,
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const insight = await InsightsService.generateExplotacionInsight(
    userId,
    explotacionId,
  );

  if (!insight) {
    return reply.status(404).send({ error: "Sin insight disponible todavía" });
  }

  return reply.send(insight);
};

export const InsightsController = { getByParcela, getByExplotacion };