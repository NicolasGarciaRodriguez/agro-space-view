import { UserPlan } from "../enums/UserPlan.enum.js";

export interface PlanLimits {
  explotacionesMaximas: number | null; // null = ilimitado
  parcelasMaximas: number | null;
  analisisPorIndicePorMes: number | null;
  insightsPorMes: number | null;
  chatbotMensajesPorPeriodo: {
    cantidad: number;
    periodoDias: number;
  } | null;
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  [UserPlan.GRATIS]: {
    explotacionesMaximas: 1,
    parcelasMaximas: 1,
    analisisPorIndicePorMes: 1,
    insightsPorMes: 1,
    chatbotMensajesPorPeriodo: { cantidad: 1, periodoDias: 7 },
  },
  [UserPlan.PRO]: {
    explotacionesMaximas: 1,
    parcelasMaximas: null,
    analisisPorIndicePorMes: null,
    insightsPorMes: null,
    chatbotMensajesPorPeriodo: { cantidad: 50, periodoDias: 1 },
  },
  [UserPlan.TECNICO]: {
    explotacionesMaximas: null,
    parcelasMaximas: null,
    analisisPorIndicePorMes: null,
    insightsPorMes: null,
    chatbotMensajesPorPeriodo: { cantidad: 150, periodoDias: 1 },
  },
};