import type { FastifyRequest } from "fastify";
import type { IInsightContenido } from "../../schemas/Insight.schema.js";
import { InsightTipo } from "@agrospace/shared/enums/InsightTipo.enum";
import { InsightAlertaNivel } from "@agrospace/shared/enums/InsightAlertaNivel.enum";

export interface InsightDTO {
  _id: string;
  parcelaId: string | null;
  tipo: InsightTipo;
  contenido: IInsightContenido;
  createdAt: string;
}

export interface GetInsightParcelaParams {
  parcelaId: string;
}

export interface GetInsightExplotacionParams {
  explotacionId: string;
}

export type GetInsightParcelaRequest = FastifyRequest<{
  Params: GetInsightParcelaParams;
}>;

export type GetInsightExplotacionRequest = FastifyRequest<{
  Params: GetInsightExplotacionParams;
}>;

// Lo que devuelve Anthropic, tras parsear el JSON
export interface AnthropicInsightResponse {
  resumen: string;
  hallazgos: string[];
  alerta: {
    nivel: InsightAlertaNivel;
    mensaje: string | null;
  };
  recomendacion: string | null;
}

export class InsightGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsightGenerationError";
  }
}
