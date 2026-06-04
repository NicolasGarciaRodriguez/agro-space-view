import type { FastifyRequest } from "fastify";


export interface CreateExplotacionBody {
  nombre: string;
  provincia: string;
  municipio: string;
  descripcion?: string;
}

export interface UpdateExplotacionBody {
  nombre?: string;
  provincia?: string;
  municipio?: string;
  descripcion?: string;
}


export interface ExplotacionParams {
  id: string;
}


export type CreateExplotacionRequest = FastifyRequest<{
  Body: CreateExplotacionBody;
}>;

export type UpdateExplotacionRequest = FastifyRequest<{
  Params: ExplotacionParams;
  Body: UpdateExplotacionBody;
}>;

export type GetExplotacionRequest = FastifyRequest<{
  Params: ExplotacionParams;
}>;

export type DeleteExplotacionRequest = FastifyRequest<{
  Params: ExplotacionParams;
}>;


export class ExplotacionNotFoundError extends Error {
  constructor() {
    super("Explotación no encontrada");
    this.name = "ExplotacionNotFoundError";
  }
}

export class ExplotacionForbiddenError extends Error {
  constructor() {
    super("No tienes permiso para acceder a esta explotación");
    this.name = "ExplotacionForbiddenError";
  }
}
