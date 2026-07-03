import { InsightTipo } from "../enums/InsightTipo.enum";
import { InsightAlertaNivel } from "../enums/InsightAlertaNivel.enum";

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
