import { InsightTipo } from "../enums/InsightTipo.enum.js";
import { InsightAlertaNivel } from "../enums/InsightAlertaNivel.enum.js";
import { IndiceTipo } from "../enums/IndiceTipo.enum.js";

export interface InsightAlertaDTO {
  nivel: InsightAlertaNivel;
  mensaje: string | null;
}

export interface InsightContenidoDTO {
  resumen: string;
  hallazgos: string[];
  alerta: InsightAlertaDTO;
  recomendacion: string | null;
}

export interface InsightDTO {
  _id: string;
  userId: string;
  explotacionId: string;
  parcelaId: string | null;
  tipo: InsightTipo;
  contenido: InsightContenidoDTO;
  createdAt: string;
}

export interface InsightNotAvailableDTO {
  error: string;
  faltantes: IndiceTipo[];
}

export type InsightOrMissingDTO =
  | { insight: InsightDTO; faltantes: null }
  | { insight: null; faltantes: IndiceTipo[] };
