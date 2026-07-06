import type { FastifyReply } from "fastify";
import { InsightsService } from "./Insights.service.js";
import {
  type GetInsightParcelaRequest,
  type GetInsightExplotacionRequest,
} from "./Insights.interface.js";

// GET /api/insights/parcela/:parcelaId
// Devuelve el último insight ya generado (no genera al vuelo — el
// insight se genera de forma asíncrona al guardar un análisis).
const getByParcela = async (
  request: GetInsightParcelaRequest,
  reply: FastifyReply,
) => {
  const { parcelaId } = request.params;
  const insight = await InsightsService.getLatestParcelaInsight(parcelaId);

  if (!insight) {
    const faltantes = await InsightsService.getMissingIndices(parcelaId);
    return reply.status(404).send({
      error: "Sin insight disponible todavía",
      faltantes, // ej: ["ndwi", "ndre"]
    });
  }

  return reply.send(insight);
};

// GET /api/insights/explotacion/:explotacionId
// Este SÍ puede generar al vuelo (con caché de 24h interno en el
// service) porque no depende de un guardado previo como trigger.
const getByExplotacion = async (
  request: GetInsightExplotacionRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { explotacionId } = request.params;

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
