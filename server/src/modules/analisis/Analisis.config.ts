import { NDVI } from "./indices/ndvi.indice.js";
import { NDWI } from "./indices/ndwi.indice.js";
import { NDRE } from "./indices/ndre.indice.js";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";

export const ANALISIS_ROUTE_PREFIX = "/api/analisis" as const;

export const SENTINEL_HUB_PROCESS_URL =
  "https://sh.dataspace.copernicus.eu/api/v1/process" as const;

export const SENTINEL_HUB_STATISTICS_URL =
  "https://sh.dataspace.copernicus.eu/api/v1/statistics" as const;

export const ANALISIS_OUTPUT = {
  width: 512,
  height: 512,
  format: "image/png",
} as const;

// ─── Tipos ────────────────────────────────────────────────────────
export interface IndiceRange {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface IndiceDefinition {
  tipo: IndiceTipo;
  label: string;
  descripcion: string;
  bands: string[];
  imageEvalscript: string;
  statisticsEvalscript: string;
  ranges: IndiceRange[];
}

// ─── Registro central ─────────────────────────────────────────────
export const INDICES: Record<IndiceTipo, IndiceDefinition> = {
  [IndiceTipo.NDVI]: NDVI,
  [IndiceTipo.NDWI]: NDWI,
  [IndiceTipo.NDRE]: NDRE,
};

export const getIndiceDefinition = (tipo: IndiceTipo): IndiceDefinition => {
  const def = INDICES[tipo];
  if (!def) throw new Error(`Índice no soportado: ${tipo}`);
  return def;
};
