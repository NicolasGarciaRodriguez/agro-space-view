import { TipoCultivo } from "../enums/TipoCultivo.enum";

export const TIPO_CULTIVO_LABELS: Record<TipoCultivo, string> = {
  [TipoCultivo.OLIVAR]: "Olivar",
  [TipoCultivo.VINEDO]: "Viñedo",
  [TipoCultivo.CEREALES]: "Cereales",
  [TipoCultivo.FRUTALES_HUESO]: "Frutales de hueso",
  [TipoCultivo.FRUTALES_PEPITA]: "Frutales de pepita",
  [TipoCultivo.CITRICOS]: "Cítricos",
  [TipoCultivo.FRUTOS_SECOS]: "Frutos secos",
  [TipoCultivo.HORTALIZAS]: "Hortalizas",
  [TipoCultivo.LEGUMINOSAS]: "Leguminosas",
  [TipoCultivo.FORRAJERAS]: "Forrajeras",
  [TipoCultivo.VIVERO]: "Vivero",
  [TipoCultivo.BARBECHO]: "Barbecho",
  [TipoCultivo.OTRO]: "Otro",
};
