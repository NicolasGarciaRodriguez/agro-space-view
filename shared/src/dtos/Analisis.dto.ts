// ─── Tipo de índice (compartido con el backend) ────────────────────

import { IndiceTipo } from "../enums/IndiceTipo.enum";

export type Bbox = [number, number, number, number];

// ═══════════════════════════════════════════════════════════════════
//  CÁLCULO (Sentinel Hub)
// ═══════════════════════════════════════════════════════════════════

export interface AnalyseParamsDTO {
  tipo: IndiceTipo;
  bbox: Bbox;
  dateFrom: string;
  dateTo: string;
  maxCloud?: number;
}

export interface AnalysisMetadataDTO {
  tipo: IndiceTipo;
  usedImageId: string;
  usedImageDate: string;
  cloudCover: number;
  bbox: Bbox;
}

export interface GetTimeSeriesDTO {
  tipo: IndiceTipo;
  bbox: Bbox;
  dateFrom: string;
  dateTo: string;
  maxCloud?: number;
}

export interface TimeSeriesPointDTO {
  date: string;
  mean: number;
  min: number;
  max: number;
}

export interface TimeSeriesResponseDTO {
  points: TimeSeriesPointDTO[];
  tipo: IndiceTipo;
  bbox: Bbox;
  dateFrom: string;
  dateTo: string;
}

// ─── Definición de índice (para el selector del frontend) ─────────

export interface IndiceRangeDTO {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface IndiceDefinitionDTO {
  tipo: IndiceTipo;
  label: string;
  descripcion: string;
  ranges: IndiceRangeDTO[];
}

// ═══════════════════════════════════════════════════════════════════
//  PERSISTENCIA (guardado)
// ═══════════════════════════════════════════════════════════════════

export interface ClimaDTO {
  tempMaxAvg: number;
  tempMinAvg: number;
  totalPrecipitation: number;
  rainyDays: number;
}

export interface CreateAnalisisDTO {
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
  clima: ClimaDTO;
  timeSeries: TimeSeriesPointDTO[];
}

export interface AnalisisDTO {
  _id: string;
  userId: string;
  explotacionId: string;
  parcelaId: string;
  tipo: IndiceTipo;
  dateFrom: string;
  dateTo: string;
  indiceMedio: number;
  cloudCover: number;
  usedImageId: string;
  usedImageDate: string;
  imageUrl: string;
  clima: ClimaDTO;
  timeSeries: TimeSeriesPointDTO[];
  createdAt: string;
}
