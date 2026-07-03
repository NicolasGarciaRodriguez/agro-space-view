import mongoose from "mongoose";
import { AnalisisModel } from "../../schemas/Analisis.schema.js";
import { InsightModel } from "../../schemas/Insight.schema.js";
import { ConversationModel } from "../../schemas/Chatbot.schema.js";
import { UserModel } from "../../schemas/User.schema.js";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { InsightTipo } from "@agrospace/shared/enums/InsightTipo.enum";
import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";
import { PLAN_LIMITS } from "@agrospace/shared/config/PlanLimits.config";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import { UsageLimitExceededError } from "./UsageLimits.interface.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";

// Inicio del mes en curso (para límites mensuales)
const startOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Inicio de un periodo relativo en días (para el chatbot, que usa
// "última semana" en vez de "mes natural")
const startOfPeriod = (periodoDias: number): Date => {
  return new Date(Date.now() - periodoDias * 24 * 60 * 60 * 1000);
};

const getUserOrThrow = async (userId: string) => {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new Error("Usuario no encontrado");
  return user;
};

// ═══════════════════════════════════════════════════════════════════
//  ANÁLISIS — límite mensual por índice
// ═══════════════════════════════════════════════════════════════════

const assertCanAnalyse = async (
  userId: string,
  tipo: IndiceTipo,
): Promise<void> => {
  const user = await getUserOrThrow(userId);
  if (user.role === UserRole.ADMIN) return;

  const limite = PLAN_LIMITS[user.plan].analisisPorIndicePorMes;
  if (limite === null) return; // ilimitado en este plan

  const count = await AnalisisModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    tipo,
    createdAt: { $gte: startOfMonth() },
  });

  if (count >= limite) {
    throw new UsageLimitExceededError(
      `Has alcanzado el límite de ${limite} análisis de ${tipo.toUpperCase()} este mes en tu plan actual. Actualiza tu plan para análisis ilimitados.`,
    );
  }
};

// ═══════════════════════════════════════════════════════════════════
//  INSIGHTS — límite mensual (independiente del de análisis)
// ═══════════════════════════════════════════════════════════════════

const canGenerateInsight = async (userId: string): Promise<boolean> => {
  const user = await getUserOrThrow(userId);
  if (user.role === UserRole.ADMIN) return true;

  const limite = PLAN_LIMITS[user.plan].insightsPorMes;
  if (limite === null) return true; // ilimitado

  const count = await InsightModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    tipo: InsightTipo.PARCELA,
    createdAt: { $gte: startOfMonth() },
  });

  return count < limite;
};

// ═══════════════════════════════════════════════════════════════════
//  CHATBOT — límite por periodo (semanal en Gratis, diario en Pro/Técnico)
// ═══════════════════════════════════════════════════════════════════

const assertCanSendChatbotMessage = async (userId: string): Promise<void> => {
  const user = await getUserOrThrow(userId);
  if (user.role === UserRole.ADMIN) return;

  const config = PLAN_LIMITS[user.plan].chatbotMensajesPorPeriodo;

  if (config === null) {
    throw new UsageLimitExceededError(
      "El chatbot no está disponible en tu plan actual. Actualiza a Pro para acceder al asistente IA.",
    );
  }

  const desde = startOfPeriod(config.periodoDias);

  // Cuenta mensajes de usuario (no del assistant) en todas sus
  // conversaciones, dentro del periodo. $unwind + $match sobre el
  // array de mensajes embebido.
  const result = await ConversationModel.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $unwind: "$messages" },
    {
      $match: {
        "messages.role": ChatRole.USER,
        "messages.createdAt": { $gte: desde },
      },
    },
    { $count: "total" },
  ]);

  const count = result[0]?.total ?? 0;

  if (count >= config.cantidad) {
    const periodoLabel =
      config.periodoDias === 1
        ? "hoy"
        : `los últimos ${config.periodoDias} días`;
    throw new UsageLimitExceededError(
      `Has alcanzado tu límite de ${config.cantidad} mensajes al chatbot (${periodoLabel}). Actualiza tu plan para más mensajes.`,
    );
  }
};

const assertCanCreateParcela = async (userId: string): Promise<void> => {
  const user = await getUserOrThrow(userId);
  if (user.role === UserRole.ADMIN) return;

  const limite = PLAN_LIMITS[user.plan].parcelasMaximas;
  if (limite === null) return;

  const count = await ParcelaModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (count >= limite) {
    throw new UsageLimitExceededError(
      `Has alcanzado el límite de ${limite} parcela${limite === 1 ? "" : "s"} en tu plan actual. Actualiza tu plan para añadir más parcelas.`,
    );
  }
};

export const UsageLimitsService = {
  assertCanAnalyse,
  canGenerateInsight,
  assertCanSendChatbotMessage,
  assertCanCreateParcela,
};
