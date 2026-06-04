import type { FastifyRequest } from "fastify";


export interface CreateAnalisisNdviBody {
  parcelaId: string;
  explotacionId: string;
  dateFrom: string;
  dateTo: string;
  ndviMedio: number;
  cloudCover: number;
  usedImageId: string;
  usedImageDate: string;
  imageBase64: string;
  clima: {
    tempMaxAvg: number;
    tempMinAvg: number;
    totalPrecipitation: number;
    rainyDays: number;
  };
  timeSeries: Array<{
    date: string;
    mean: number;
    min: number;
    max: number;
  }>;
}


export interface GetAnalisisNdviQuery {
  parcelaId: string;
  limit?: number;
}


export interface AnalisisNdviParams {
  id: string;
}


export type CreateAnalisisNdviRequest = FastifyRequest<{
  Body: CreateAnalisisNdviBody;
}>;

export type GetAnalisisNdviRequest = FastifyRequest<{
  Querystring: GetAnalisisNdviQuery;
}>;

export type DeleteAnalisisNdviRequest = FastifyRequest<{
  Params: AnalisisNdviParams;
}>;


export class AnalisisNdviNotFoundError extends Error {
  constructor() {
    super("Análisis no encontrado");
    this.name = "AnalisisNdviNotFoundError";
  }
}
