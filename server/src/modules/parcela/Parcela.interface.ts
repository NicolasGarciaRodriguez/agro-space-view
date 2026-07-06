import type { FastifyRequest } from "fastify";
import { TipoCultivo } from "@agrospace/shared/enums/TipoCultivo.enum";
import { ManejoCultivo } from "@agrospace/shared/enums/ManejoCultivo.enum";

export interface CreateParcelaBody {
  nombre: string;
  refCatastral: string;
  tipoCultivo?: TipoCultivo;
  variedad?: string;
  manejo?: ManejoCultivo;
}

export interface UpdateParcelaBody {
  nombre?: string;
  tipoCultivo?: TipoCultivo;
  variedad?: string;
  manejo?: ManejoCultivo;
}

export interface ParcelaParams {
  explotacionId: string;
  id: string;
}

export interface ExplotacionOnlyParams {
  explotacionId: string;
}

export type CreateParcelaRequest = FastifyRequest<{
  Params: ExplotacionOnlyParams;
  Body: CreateParcelaBody;
}>;

export type GetParcelasRequest = FastifyRequest<{
  Params: ExplotacionOnlyParams;
}>;

export type GetParcelaRequest = FastifyRequest<{
  Params: ParcelaParams;
}>;

export type UpdateParcelaRequest = FastifyRequest<{
  Params: ParcelaParams;
  Body: UpdateParcelaBody;
}>;

export type DeleteParcelaRequest = FastifyRequest<{
  Params: ParcelaParams;
}>;

export class ParcelaNotFoundError extends Error {
  constructor() {
    super("Parcela no encontrada");
    this.name = "ParcelaNotFoundError";
  }
}

export class ParcelaForbiddenError extends Error {
  constructor() {
    super("No tienes permiso para acceder a esta parcela");
    this.name = "ParcelaForbiddenError";
  }
}

export class ParcelaAlreadyExistsError extends Error {
  constructor() {
    super(
      "Ya tienes una parcela con esa referencia catastral en esta explotación",
    );
    this.name = "ParcelaAlreadyExistsError";
  }
}
