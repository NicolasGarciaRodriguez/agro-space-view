import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import type { FastifyRequest } from "fastify";

// ═══════════════════════════════════════════════════════════════════
//  CÁLCULO
// ═══════════════════════════════════════════════════════════════════

export interface AnalyseBody {
  tipo: IndiceTipo;
  explotacionId: string;
  bbox: number[];
  dateFrom: string;
  dateTo: string;
  maxCloud?: number;
}

export interface GetTimeSeriesQuery {
  tipo: IndiceTipo;
  bbox: string;
  dateFrom: string;
  dateTo: string;
  maxCloud?: number;
}

export type AnalyseRequest = FastifyRequest<{ Body: AnalyseBody }>;
export type GetTimeSeriesRequest = FastifyRequest<{
  Querystring: GetTimeSeriesQuery;
}>;

// ─── Sentinel Hub ─────────────────────────────────────────────────

export interface SentinelHubProcessBody {
  input: {
    bounds: {
      bbox: number[];
      properties: { crs: string };
    };
    data: Array<{
      type: string;
      dataFilter: {
        timeRange: { from: string; to: string };
        maxCloudCoverage: number;
      };
    }>;
  };
  output: {
    width: number;
    height: number;
    responses: Array<{
      identifier: string;
      format: { type: string };
    }>;
  };
  evalscript: string;
}

export interface SHStatisticsResponse {
  data: Array<{
    interval: { from: string; to: string };
    outputs: {
      index: {
        bands: {
          B0: { stats: { mean: number; min: number; max: number } };
        };
      };
    };
  }>;
}

export interface AnalysisMetadata {
  tipo: IndiceTipo;
  usedImageId: string;
  usedImageDate: string;
  cloudCover: number;
  bbox: number[];
}

export interface TimeSeriesPoint {
  date: string;
  mean: number;
  min: number;
  max: number;
}

export interface TimeSeriesResponse {
  points: TimeSeriesPoint[];
  tipo: IndiceTipo;
  bbox: number[];
  dateFrom: string;
  dateTo: string;
}

// ═══════════════════════════════════════════════════════════════════
//  PERSISTENCIA
// ═══════════════════════════════════════════════════════════════════

export interface ClimaData {
  tempMaxAvg: number;
  tempMinAvg: number;
  totalPrecipitation: number;
  rainyDays: number;
}

export interface CreateAnalisisBody {
  parcelaId: string;
  explotacionId: string;
  tipo: IndiceTipo;
  dateFrom: string;
  dateTo: string;
  indiceMedio: number;
  cloudCover: number;
  usedImageId: string;
  usedImageDate: string;
  imageBase64: string;
  clima: ClimaData;
  timeSeries: TimeSeriesPoint[];
}

export interface GetAnalisisQuery {
  parcelaId: string;
  tipo?: IndiceTipo; // opcional: filtra por índice o devuelve todos
  limit?: number;
}

export interface AnalisisParams {
  id: string;
}

export type CreateAnalisisRequest = FastifyRequest<{
  Body: CreateAnalisisBody;
}>;
export type GetAnalisisRequest = FastifyRequest<{
  Querystring: GetAnalisisQuery;
}>;
export type DeleteAnalisisRequest = FastifyRequest<{ Params: AnalisisParams }>;

// ═══════════════════════════════════════════════════════════════════
//  ERRORES
// ═══════════════════════════════════════════════════════════════════

export class AnalisisNotFoundError extends Error {
  constructor() {
    super("Análisis no encontrado");
    this.name = "AnalisisNotFoundError";
  }
}

export class AnalisisForbiddenError extends Error {
  constructor() {
    super("No tienes permiso para acceder a este análisis");
    this.name = "AnalisisForbiddenError";
  }
}
