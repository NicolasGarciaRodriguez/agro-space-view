import type { FastifyRequest } from "fastify";
import type { IEntradaDatos } from "../../schemas/CuadernoEntrada.schema.js";
import { EntradaTipo } from "@agrospace/shared/enums/EntradaTipo.enum";

export interface CreateEntradaBody {
  parcelaId: string;
  explotacionId: string;
  fecha: string;
  tipo: EntradaTipo;
  datos: IEntradaDatos;
  notas?: string;
}

export interface UpdateEntradaBody {
  fecha?: string;
  datos?: IEntradaDatos;
  notas?: string;
}

export interface GetEntradasQuery {
  parcelaId?: string;
  explotacionId?: string;
  tipo?: EntradaTipo;
  limit?: number;
  page?: number;
}

export interface EntradaParams {
  id: string;
}

export type CreateEntradaRequest = FastifyRequest<{
  Body: CreateEntradaBody;
}>;

export type GetEntradasRequest = FastifyRequest<{
  Querystring: GetEntradasQuery;
}>;

export type UpdateEntradaRequest = FastifyRequest<{
  Params: EntradaParams;
  Body: UpdateEntradaBody;
}>;

export type DeleteEntradaRequest = FastifyRequest<{
  Params: EntradaParams;
}>;

export class EntradaNotFoundError extends Error {
  constructor() {
    super("Entrada no encontrada");
    this.name = "EntradaNotFoundError";
  }
}

export class EntradaForbiddenError extends Error {
  constructor() {
    super("No tienes permiso para acceder a esta entrada");
    this.name = "EntradaForbiddenError";
  }
}
