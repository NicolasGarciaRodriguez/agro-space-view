import { UserPlan } from "../enums/UserPlan.enum.js";

export interface PlanLimits {
  parcelasMaximas: number | null; // null = ilimitado
  analisisPorIndicePorMes: number | null;
  insightsPorMes: number | null;
  chatbotMensajesPorPeriodo: {
    cantidad: number;
    periodoDias: number;
  } | null;
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  [UserPlan.GRATIS]: {
    parcelasMaximas: 1,
    analisisPorIndicePorMes: 1,
    insightsPorMes: 1,
    chatbotMensajesPorPeriodo: { cantidad: 1, periodoDias: 7 },
  },
  [UserPlan.PRO]: {
    parcelasMaximas: null,
    analisisPorIndicePorMes: null,
    insightsPorMes: null,
    chatbotMensajesPorPeriodo: { cantidad: 50, periodoDias: 1 },
  },
  [UserPlan.TECNICO]: {
    parcelasMaximas: null,
    analisisPorIndicePorMes: null,
    insightsPorMes: null,
    chatbotMensajesPorPeriodo: { cantidad: 150, periodoDias: 1 },
  },
};
