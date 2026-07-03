import mongoose, { type FlattenMaps } from "mongoose";
import { AnthropicService } from "../../services/Anthropic.service.js";
import { AnalisisModel } from "../../schemas/Analisis.schema.js";
import { CuadernoEntradaModel } from "../../schemas/CuadernoEntrada.schema.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import {
  InsightModel,
  type IInsightDocument,
} from "../../schemas/Insight.schema.js";
import { InsightTipo } from "@agrospace/shared/enums/InsightTipo.enum";
import {
  INSIGHTS_MODEL,
  INSIGHTS_MAX_TOKENS,
  CONTEXT_ANALISIS_LIMIT,
  CONTEXT_CUADERNO_LIMIT,
  EXPLOTACION_INSIGHT_MIN_INTERVAL_HOURS,
  PARCELA_INSIGHT_SYSTEM_PROMPT,
  EXPLOTACION_INSIGHT_SYSTEM_PROMPT,
} from "./Insights.config.js";
import {
  InsightGenerationError,
  type AnthropicInsightResponse,
} from "./Insights.interface.js";
import { UsageLimitsService } from "../usageLimits/UsageLimits.service.js";

type LeanInsight = FlattenMaps<IInsightDocument> & {
  _id: mongoose.Types.ObjectId;
};

// ═══════════════════════════════════════════════════════════════════
//  INSIGHT DE PARCELA
// ═══════════════════════════════════════════════════════════════════

// Comprueba si hay datos nuevos desde el último insight de esta parcela.
// Evita regenerar (y gastar) si no ha cambiado nada.
const hasNewDataSinceLastInsight = async (
  parcelaId: mongoose.Types.ObjectId,
): Promise<boolean> => {
  const lastInsight = await InsightModel.findOne({
    parcelaId,
    tipo: InsightTipo.PARCELA,
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!lastInsight) return true; // nunca se generó, hay que generar

  const [nuevoAnalisis, nuevaEntrada] = await Promise.all([
    AnalisisModel.exists({
      parcelaId,
      createdAt: { $gt: lastInsight.createdAt },
    }),
    CuadernoEntradaModel.exists({
      parcelaId,
      createdAt: { $gt: lastInsight.createdAt },
    }),
  ]);

  return Boolean(nuevoAnalisis || nuevaEntrada);
};

const buildParcelaContext = async (
  parcelaId: mongoose.Types.ObjectId,
): Promise<{
  prompt: string;
  analisisIds: mongoose.Types.ObjectId[];
  cuadernoIds: mongoose.Types.ObjectId[];
}> => {
  const parcela = await ParcelaModel.findById(parcelaId).lean();

  // Últimos N análisis de CADA tipo (no solo los N más recientes en
  // global, porque si NDVI se analiza más a menudo, NDWI y NDRE
  // podrían quedar fuera).
  const analisis = await AnalisisModel.aggregate([
    { $match: { parcelaId } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$tipo",
        docs: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        docs: { $slice: ["$docs", CONTEXT_ANALISIS_LIMIT] },
      },
    },
  ]);

  const cuaderno = await CuadernoEntradaModel.find({ parcelaId })
    .sort({ fecha: -1 })
    .limit(CONTEXT_CUADERNO_LIMIT)
    .lean();

  const analisisFlat = analisis.flatMap((g) => g.docs);

  const analisisText = analisisFlat.length
    ? analisisFlat
        .map(
          (a) =>
            `- [${a.tipo.toUpperCase()}] ${a.dateFrom} a ${a.dateTo}: valor medio ${a.indiceMedio.toFixed(3)}, nubosidad ${a.cloudCover.toFixed(1)}%, temp. máx. media ${a.clima.tempMaxAvg}°C, precipitación total ${a.clima.totalPrecipitation}mm`,
        )
        .join("\n")
    : "No hay análisis registrados todavía.";

  const cuadernoText = cuaderno.length
    ? cuaderno
        .map((e) => {
          const datos = Object.entries(e.datos)
            .filter(([, v]) => v !== undefined && v !== "")
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          return `- [${e.tipo.toUpperCase()}] ${e.fecha.toISOString().split("T")[0]}: ${datos}${e.notas ? ` — nota: ${e.notas}` : ""}`;
        })
        .join("\n")
    : "No hay entradas de cuaderno registradas todavía.";

  const prompt = `Parcela: ${parcela?.nombre ?? "Sin nombre"} (${parcela?.superficie ?? "?"} m²)

ANÁLISIS SATELITALES RECIENTES:
${analisisText}

CUADERNO DE CAMPO RECIENTE:
${cuadernoText}

Genera el diagnóstico de esta parcela según las instrucciones.`;

  return {
    prompt,
    analisisIds: analisisFlat.map((a) => a._id),
    cuadernoIds: cuaderno.map((c) => c._id),
  };
};

const generateParcelaInsight = async (
  userId: string,
  explotacionId: string,
  parcelaId: string,
): Promise<IInsightDocument> => {
  const parcelaObjectId = new mongoose.Types.ObjectId(parcelaId);

  const { prompt, analisisIds, cuadernoIds } =
    await buildParcelaContext(parcelaObjectId);

  let result: AnthropicInsightResponse;
  try {
    result = await AnthropicService.generateJSON<AnthropicInsightResponse>({
      model: INSIGHTS_MODEL,
      maxTokens: INSIGHTS_MAX_TOKENS,
      systemPrompt: PARCELA_INSIGHT_SYSTEM_PROMPT,
      userPrompt: prompt,
    });
  } catch (error) {
    throw new InsightGenerationError(
      `Error generando insight de parcela: ${(error as Error).message}`,
    );
  }

  const insight = await InsightModel.create({
    userId,
    explotacionId,
    parcelaId: parcelaObjectId,
    tipo: InsightTipo.PARCELA,
    contenido: result,
    basedOn: { analisisIds, cuadernoIds },
  });

  return insight;
};

const maybeGenerateParcelaInsight = async (
  userId: string,
  explotacionId: string,
  parcelaId: string,
): Promise<void> => {
  try {
    const parcelaObjectId = new mongoose.Types.ObjectId(parcelaId);
    const shouldGenerate = await hasNewDataSinceLastInsight(parcelaObjectId);

    if (!shouldGenerate) return;

    const canGenerate = await UsageLimitsService.canGenerateInsight(userId);
    if (!canGenerate) return; // límite del plan alcanzado, no genera, no avisa

    await generateParcelaInsight(userId, explotacionId, parcelaId);
  } catch (error) {
    console.error("Error generando insight de parcela (no bloqueante):", error);
  }
};

const getLatestParcelaInsight = async (
  parcelaId: string,
): Promise<LeanInsight | null> => {
  return InsightModel.findOne({
    parcelaId: new mongoose.Types.ObjectId(parcelaId),
    tipo: InsightTipo.PARCELA,
  })
    .sort({ createdAt: -1 })
    .lean();
};

// ═══════════════════════════════════════════════════════════════════
//  INSIGHT DE EXPLOTACIÓN
// ═══════════════════════════════════════════════════════════════════

const canRegenerateExplotacionInsight = async (
  explotacionId: mongoose.Types.ObjectId,
): Promise<boolean> => {
  const last = await InsightModel.findOne({
    explotacionId,
    tipo: InsightTipo.EXPLOTACION,
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!last) return true;

  const hoursSince =
    (Date.now() - new Date(last.createdAt).getTime()) / (1000 * 60 * 60);

  return hoursSince >= EXPLOTACION_INSIGHT_MIN_INTERVAL_HOURS;
};

const buildExplotacionContext = async (
  explotacionId: mongoose.Types.ObjectId,
): Promise<string> => {
  const parcelas = await ParcelaModel.find({ explotacionId }).lean();

  // Reutiliza los insights de parcela ya generados — no vuelve a
  // mandar datos crudos, así el coste no escala con el nº de análisis.
  const parcelasConInsight = await Promise.all(
    parcelas.map(async (p) => {
      const insight = await InsightModel.findOne({
        parcelaId: p._id,
        tipo: InsightTipo.PARCELA,
      })
        .sort({ createdAt: -1 })
        .lean();

      return { parcela: p, insight };
    }),
  );

  const text = parcelasConInsight
    .map(({ parcela, insight }) => {
      if (!insight) {
        return `- ${parcela.nombre}: sin diagnóstico todavía (sin análisis registrados).`;
      }
      return `- ${parcela.nombre}: ${insight.contenido.resumen} [alerta: ${insight.contenido.alerta.nivel}]`;
    })
    .join("\n");

  return `Explotación con ${parcelas.length} parcela(s):\n\n${text}\n\nGenera el resumen de la explotación según las instrucciones.`;
};

const generateExplotacionInsight = async (
  userId: string,
  explotacionId: string,
): Promise<IInsightDocument | null> => {
  const explotacionObjectId = new mongoose.Types.ObjectId(explotacionId);

  const canRegenerate =
    await canRegenerateExplotacionInsight(explotacionObjectId);
  if (!canRegenerate) {
    const last = await InsightModel.findOne({
      explotacionId: explotacionObjectId,
      tipo: InsightTipo.EXPLOTACION,
    }).sort({ createdAt: -1 });

    if (last) return last;
  }

  // Guarda de coste: si ninguna parcela tiene insight propio todavía,
  // no tiene sentido llamar a Anthropic — devolvería algo genérico
  // sin valor real. Ahorramos la llamada.
  const hasAnyParcelaInsight = await InsightModel.exists({
    explotacionId: explotacionObjectId,
    tipo: InsightTipo.PARCELA,
  });

  if (!hasAnyParcelaInsight) {
    return null;
  }

  const prompt = await buildExplotacionContext(explotacionObjectId);

  let result: AnthropicInsightResponse;
  try {
    result = await AnthropicService.generateJSON<AnthropicInsightResponse>({
      model: INSIGHTS_MODEL,
      maxTokens: INSIGHTS_MAX_TOKENS,
      systemPrompt: EXPLOTACION_INSIGHT_SYSTEM_PROMPT,
      userPrompt: prompt,
    });
  } catch (error) {
    throw new InsightGenerationError(
      `Error generando insight de explotación: ${(error as Error).message}`,
    );
  }

  const insight = await InsightModel.create({
    userId,
    explotacionId: explotacionObjectId,
    parcelaId: null,
    tipo: InsightTipo.EXPLOTACION,
    contenido: result,
    basedOn: { analisisIds: [], cuadernoIds: [] },
  });

  return insight;
};

export const InsightsService = {
  maybeGenerateParcelaInsight,
  getLatestParcelaInsight,
  generateExplotacionInsight,
};
