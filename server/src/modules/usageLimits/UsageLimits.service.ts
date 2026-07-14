import mongoose from "mongoose";
import { AnalisisModel } from "../../schemas/Analisis.schema.js";
import { InsightModel } from "../../schemas/Insight.schema.js";
import { ConversationModel } from "../../schemas/Chatbot.schema.js";
import { UserModel } from "../../schemas/User.schema.js";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";
import { InsightTipo } from "@agrospace/shared/enums/InsightTipo.enum";
import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import { UsageLimitExceededError } from "./UsageLimits.interface.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { PLAN_LIMITS } from "@agrospace/shared/config/PlanLimits.config";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";

const startOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

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
  if (limite === null) return;

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
  if (limite === null) return true;

  const count = await InsightModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    tipo: InsightTipo.PARCELA,
    createdAt: { $gte: startOfMonth() },
  });

  return count < limite;
};

// ═══════════════════════════════════════════════════════════════════
//  CHATBOT — límite por periodo, COMPARTIDO a nivel de explotación
// ═══════════════════════════════════════════════════════════════════

// El cupo de mensajes es de la EXPLOTACIÓN, no de la persona que
// escribe. Se mide siempre contra el plan del DUEÑO, y se cuentan
// todos los mensajes de todas las conversaciones de esa explotación,
// sin importar qué colaborador los haya escrito — así el dueño y
// sus colaboradores comparten y agotan el mismo cupo.
const assertCanSendChatbotMessage = async (
  explotacionId: string,
  planDelDueño: UserPlan,
  dueñoEsAdmin: boolean,
): Promise<void> => {
  if (dueñoEsAdmin) return;

  const config = PLAN_LIMITS[planDelDueño].chatbotMensajesPorPeriodo;

  if (config === null) {
    throw new UsageLimitExceededError(
      "El chatbot no está disponible en el plan de esta explotación. Actualiza a Pro para acceder al asistente IA.",
    );
  }

  const desde = startOfPeriod(config.periodoDias);

  const result = await ConversationModel.aggregate([
    {
      $match: {
        explotacionId: new mongoose.Types.ObjectId(explotacionId),
      },
    },
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
      `Esta explotación ha alcanzado su límite de ${config.cantidad} mensajes al chatbot (${periodoLabel}), compartido entre el titular y sus colaboradores.`,
    );
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PARCELAS — límite por explotación
// ═══════════════════════════════════════════════════════════════════

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

const assertCanInviteToExplotacion = async (userId: string): Promise<void> => {
  const user = await getUserOrThrow(userId);
  if (user.role === UserRole.ADMIN) return;

  if (user.plan !== UserPlan.TECNICO) {
    throw new UsageLimitExceededError(
      "Compartir explotaciones con colaboradores requiere el plan Técnico.",
    );
  }
};

const assertCanCreateExplotacion = async (userId: string): Promise<void> => {
  const user = await getUserOrThrow(userId);
  if (user.role === UserRole.ADMIN) return;

  const limite = PLAN_LIMITS[user.plan].explotacionesMaximas;
  if (limite === null) return;

  const count = await ExplotacionModel.countDocuments({ userId });

  if (count >= limite) {
    throw new UsageLimitExceededError(
      `Has alcanzado el límite de ${limite} explotación${limite === 1 ? "" : "es"} en tu plan actual. Actualiza al plan Técnico para gestionar varias explotaciones.`,
    );
  }
};

export const UsageLimitsService = {
  assertCanAnalyse,
  canGenerateInsight,
  assertCanSendChatbotMessage,
  assertCanCreateParcela,
  assertCanInviteToExplotacion,
  assertCanCreateExplotacion,
};