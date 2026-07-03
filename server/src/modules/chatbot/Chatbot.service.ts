import mongoose, { type FlattenMaps } from "mongoose";
import { AnthropicService } from "../../services/Anthropic.service.js";
import { AnalisisModel } from "../../schemas/Analisis.schema.js";
import { CuadernoEntradaModel } from "../../schemas/CuadernoEntrada.schema.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { InsightModel } from "../../schemas/Insight.schema.js";
import {
  ConversationModel,
  type IConversationDocument,
} from "../../schemas/Chatbot.schema.js";
import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";
import { ChatbotTool } from "@agrospace/shared/enums/ChatbotTool.enum";
import { InsightTipo } from "@agrospace/shared/enums/InsightTipo.enum";
import {
  CHATBOT_MODEL,
  CHATBOT_MAX_TOKENS,
  CHATBOT_TOOLS,
  CHATBOT_SYSTEM_PROMPT_TEMPLATE,
} from "./Chatbot.config.js";
import { ConversationNotFoundError } from "./Chatbot.interface.js";
import type { AnthropicMessage } from "../../services/Anthropic.service.js";

type LeanConversation = FlattenMaps<IConversationDocument> & {
  _id: mongoose.Types.ObjectId;
};

// ═══════════════════════════════════════════════════════════════════
//  CONTEXTO LIGERO — resumen barato de la explotación
// ═══════════════════════════════════════════════════════════════════

const buildExplotacionSummary = async (
  userId: string,
  explotacionId: string,
  parcelaActivaId: string | null,
): Promise<string> => {
  const parcelas = await ParcelaModel.find({ explotacionId, userId }).lean();

  if (parcelas.length === 0) {
    return "La explotación todavía no tiene parcelas registradas.";
  }

  const parcelaIds = parcelas.map((p) => p._id);

  const ultimosAnalisis = await AnalisisModel.aggregate([
    { $match: { parcelaId: { $in: parcelaIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { parcelaId: "$parcelaId", tipo: "$tipo" },
        indiceMedio: { $first: "$indiceMedio" },
        createdAt: { $first: "$createdAt" },
      },
    },
  ]);

  const analisisPorParcela = new Map<string, typeof ultimosAnalisis>();
  for (const a of ultimosAnalisis) {
    const key = a._id.parcelaId.toString();
    const list = analisisPorParcela.get(key) ?? [];
    list.push(a);
    analisisPorParcela.set(key, list);
  }

  const parcelasText = parcelas
    .map((p) => {
      const analisis = analisisPorParcela.get(p._id.toString()) ?? [];
      const indicesText = analisis.length
        ? analisis
            .map(
              (a) => `${a._id.tipo.toUpperCase()}: ${a.indiceMedio.toFixed(3)}`,
            )
            .join(", ")
        : "sin análisis todavía";

      const esActiva = parcelaActivaId === p._id.toString();
      const marcador = esActiva
        ? " ← EL USUARIO ESTÁ VIENDO ESTA PARCELA AHORA MISMO"
        : "";

      return `- ${p.nombre} (id: ${p._id}, ${p.superficie} m²): ${indicesText}${marcador}`;
    })
    .join("\n");

  const insightExplotacion = await InsightModel.findOne({
    explotacionId,
    tipo: InsightTipo.EXPLOTACION,
  })
    .sort({ createdAt: -1 })
    .lean();

  const insightText = insightExplotacion
    ? `\n\nÚltimo diagnóstico general de la explotación: ${insightExplotacion.contenido.resumen}`
    : "";

  return `Parcelas (${parcelas.length}):\n${parcelasText}${insightText}`;
};
// ═══════════════════════════════════════════════════════════════════
//  TOOLS — ejecución real contra Mongo
// ═══════════════════════════════════════════════════════════════════

const assertParcelaOwnership = async (
  userId: string,
  parcelaId: string,
): Promise<void> => {
  if (!mongoose.isValidObjectId(parcelaId)) {
    throw new Error("ID de parcela inválido");
  }
  const parcela = await ParcelaModel.exists({ _id: parcelaId, userId });
  if (!parcela) {
    throw new Error("Parcela no encontrada o no pertenece al usuario");
  }
};

const executeGetHistorialParcela = async (
  userId: string,
  input: Record<string, unknown>,
): Promise<string> => {
  const parcelaId = input.parcelaId as string;
  const tipo = input.tipo as string | undefined;

  await assertParcelaOwnership(userId, parcelaId);

  const filter: Record<string, unknown> = { parcelaId };
  if (tipo) filter.tipo = tipo;

  const analisis = await AnalisisModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  if (analisis.length === 0) {
    return (
      "No hay análisis registrados para esta parcela" +
      (tipo ? ` con el índice ${tipo}` : "") +
      "."
    );
  }

  return analisis
    .map(
      (a) =>
        `[${a.tipo.toUpperCase()}] ${a.dateFrom} a ${a.dateTo}: ${a.indiceMedio.toFixed(3)} (nubosidad ${a.cloudCover.toFixed(1)}%, guardado el ${a.createdAt.toISOString().split("T")[0]})`,
    )
    .join("\n");
};

const executeGetCuadernoParcela = async (
  userId: string,
  input: Record<string, unknown>,
): Promise<string> => {
  const parcelaId = input.parcelaId as string;
  const tipoEntrada = input.tipoEntrada as string | undefined;

  await assertParcelaOwnership(userId, parcelaId);

  const filter: Record<string, unknown> = { parcelaId };
  if (tipoEntrada) filter.tipo = tipoEntrada;

  const entradas = await CuadernoEntradaModel.find(filter)
    .sort({ fecha: -1 })
    .limit(15)
    .lean();

  if (entradas.length === 0) {
    return (
      "No hay entradas de cuaderno registradas para esta parcela" +
      (tipoEntrada ? ` de tipo ${tipoEntrada}` : "") +
      "."
    );
  }

  return entradas
    .map((e) => {
      const datos = Object.entries(e.datos)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      return `[${e.tipo.toUpperCase()}] ${e.fecha.toISOString().split("T")[0]}: ${datos}${e.notas ? ` — nota: ${e.notas}` : ""}`;
    })
    .join("\n");
};

const executeGetInsightParcela = async (
  userId: string,
  input: Record<string, unknown>,
): Promise<string> => {
  const parcelaId = input.parcelaId as string;

  await assertParcelaOwnership(userId, parcelaId);

  const insight = await InsightModel.findOne({
    parcelaId,
    tipo: InsightTipo.PARCELA,
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!insight) {
    return "No hay diagnóstico generado todavía para esta parcela.";
  }

  const { resumen, hallazgos, alerta, recomendacion } = insight.contenido;

  return [
    `Resumen: ${resumen}`,
    hallazgos.length ? `Hallazgos: ${hallazgos.join("; ")}` : null,
    `Alerta: ${alerta.nivel}${alerta.mensaje ? ` — ${alerta.mensaje}` : ""}`,
    recomendacion ? `Recomendación: ${recomendacion}` : null,
  ]
    .filter(Boolean)
    .join("\n");
};

const buildExecuteTool = (userId: string) => {
  return async (
    toolName: string,
    input: Record<string, unknown>,
  ): Promise<string> => {
    switch (toolName) {
      case ChatbotTool.GET_HISTORIAL_PARCELA:
        return executeGetHistorialParcela(userId, input);
      case ChatbotTool.GET_CUADERNO_PARCELA:
        return executeGetCuadernoParcela(userId, input);
      case ChatbotTool.GET_INSIGHT_PARCELA:
        return executeGetInsightParcela(userId, input);
      default:
        return `Herramienta desconocida: ${toolName}`;
    }
  };
};

// ═══════════════════════════════════════════════════════════════════
//  CONVERSACIONES
// ═══════════════════════════════════════════════════════════════════

const createConversation = async (
  userId: string,
  explotacionId: string,
  parcelaId: string | null,
): Promise<IConversationDocument> => {
  return ConversationModel.create({
    userId,
    explotacionId,
    parcelaId,
    titulo: "Nueva conversación",
    messages: [],
  });
};

const getConversation = async (
  userId: string,
  conversationId: string,
): Promise<IConversationDocument> => {
  if (!mongoose.isValidObjectId(conversationId)) {
    throw new ConversationNotFoundError();
  }
  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    userId,
  });
  if (!conversation) throw new ConversationNotFoundError();
  return conversation;
};

const listConversations = async (
  userId: string,
  explotacionId: string,
): Promise<LeanConversation[]> => {
  return ConversationModel.find({ userId, explotacionId })
    .sort({ updatedAt: -1 })
    .select("titulo parcelaId createdAt updatedAt")
    .lean();
};

const generateTitulo = (firstMessage: string): string => {
  const trimmed = firstMessage.trim();
  return trimmed.length > 50 ? `${trimmed.slice(0, 50)}...` : trimmed;
};

const isValidChatbotTool = (tool: string): tool is ChatbotTool =>
  Object.values(ChatbotTool).includes(tool as ChatbotTool);

const sendMessage = async (
  userId: string,
  explotacionId: string,
  conversationId: string,
  userMessage: string,
): Promise<IConversationDocument> => {
  const conversation = await getConversation(userId, conversationId);

  if (conversation.messages.length === 0) {
    conversation.titulo = generateTitulo(userMessage);
  }

  conversation.messages.push({
    role: ChatRole.USER,
    content: userMessage,
    createdAt: new Date(),
  });

  const contextoLigero = await buildExplotacionSummary(
    userId,
    explotacionId,
    conversation.parcelaId ? conversation.parcelaId.toString() : null,
  );
  const systemPrompt = CHATBOT_SYSTEM_PROMPT_TEMPLATE(contextoLigero);

  const anthropicMessages: AnthropicMessage[] = conversation.messages.map(
    (m) => ({
      role: m.role,
      content: m.content,
    }),
  );

  const result = await AnthropicService.generateWithTools({
    model: CHATBOT_MODEL,
    maxTokens: CHATBOT_MAX_TOKENS,
    systemPrompt,
    messages: anthropicMessages,
    tools: CHATBOT_TOOLS,
    executeTool: buildExecuteTool(userId),
  });

  conversation.messages.push({
    role: ChatRole.ASSISTANT,
    content: result.finalText,
    toolCalls:
      result.toolCalls.length > 0
        ? result.toolCalls
            .filter((tc) => isValidChatbotTool(tc.tool))
            .map((tc) => ({ tool: tc.tool as ChatbotTool, input: tc.input }))
        : undefined,
    createdAt: new Date(),
  });

  await conversation.save();
  return conversation;
};

const removeConversation = async (
  userId: string,
  conversationId: string,
): Promise<void> => {
  const conversation = await getConversation(userId, conversationId);
  await conversation.deleteOne();
};

export const ChatbotService = {
  createConversation,
  getConversation,
  listConversations,
  sendMessage,
  removeConversation,
};
