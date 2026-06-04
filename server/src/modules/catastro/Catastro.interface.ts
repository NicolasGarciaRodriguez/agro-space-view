import type { FastifyRequest } from "fastify";

export interface GetParcelByRefQuery {
  ref: string;
}

export interface GetParcelByCoordsQuery {
  lat: number;
  lon: number;
}

export type GetParcelByRefRequest = FastifyRequest<{
  Querystring: GetParcelByRefQuery;
}>;

export type GetParcelByCoordsRequest = FastifyRequest<{
  Querystring: GetParcelByCoordsQuery;
}>;

export type LonLat = [number, number];

export interface CadastralParcel {
  ref: string;
  area: number;
  description: string;
  center: LonLat;
  bbox: [number, number, number, number];
  polygon: LonLat[];
}

export class CatastroNotFoundError extends Error {
  constructor(ref: string) {
    super(`No se encontró ninguna parcela con referencia: ${ref}`);
    this.name = "CatastroNotFoundError";
  }
}

export class CatastroParseError extends Error {
  constructor(message: string) {
    super(`Error parseando respuesta del Catastro: ${message}`);
    this.name = "CatastroParseError";
  }
}
