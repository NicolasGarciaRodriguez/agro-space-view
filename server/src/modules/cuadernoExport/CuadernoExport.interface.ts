import type { FastifyRequest } from "fastify";

export interface ExportQuery {
  dateFrom?: string;
  dateTo?: string;
}

export interface ExportParcelaParams {
  parcelaId: string;
}

export interface ExportExplotacionParams {
  explotacionId: string;
}

export type ExportParcelaRequest = FastifyRequest<{
  Params: ExportParcelaParams;
  Querystring: ExportQuery;
}>;

export type ExportExplotacionRequest = FastifyRequest<{
  Params: ExportExplotacionParams;
  Querystring: ExportQuery;
}>;

export class ExportForbiddenError extends Error {
  constructor() {
    super("No tienes permiso para exportar estos datos");
    this.name = "ExportForbiddenError";
  }
}