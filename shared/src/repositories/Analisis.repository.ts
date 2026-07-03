import config from "../config/index.config.js";
import HttpService from "../services/Http.service.js";
import type {
  AnalyseParamsDTO,
  AnalysisMetadataDTO,
  GetTimeSeriesDTO,
  TimeSeriesResponseDTO,
  IndiceDefinitionDTO,
  CreateAnalisisDTO,
  AnalisisDTO,
} from "../dtos/Analisis.dto.js";
import { IndiceTipo } from "../enums/IndiceTipo.enum.js";

const BASE = `${config.API_URL}/api/analisis`;

export interface AnalysisResult {
  imageUrl: string;
  imageBase64: string;
  metadata: AnalysisMetadataDTO;
}

// ═══════════════════════════════════════════════════════════════════
//  CÁLCULO
// ═══════════════════════════════════════════════════════════════════

const analyse = async (params: AnalyseParamsDTO): Promise<AnalysisResult> => {
  const res = await HttpService.postBlob(`${BASE}/process`, params);

  const metadata: AnalysisMetadataDTO = {
    tipo: params.tipo,
    usedImageId: res.headers.get("X-Analisis-Image-Id") ?? "",
    usedImageDate: res.headers.get("X-Analisis-Image-Date") ?? "",
    cloudCover: Number(res.headers.get("X-Analisis-Cloud-Cover") ?? 0),
    bbox: params.bbox,
  };

  const blob = await res.blob();
  const imageUrl = URL.createObjectURL(blob);

  const imageBase64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });

  return { imageUrl, imageBase64, metadata };
};

const getTimeSeries = async (
  params: GetTimeSeriesDTO,
): Promise<TimeSeriesResponseDTO> => {
  return HttpService.get(`${BASE}/timeseries`, {
    tipo: params.tipo,
    bbox: params.bbox.join(","),
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    maxCloud: params.maxCloud,
  }) as Promise<TimeSeriesResponseDTO>;
};

const getIndices = async (): Promise<IndiceDefinitionDTO[]> => {
  return HttpService.get(`${BASE}/indices`) as Promise<IndiceDefinitionDTO[]>;
};

// ═══════════════════════════════════════════════════════════════════
//  PERSISTENCIA
// ═══════════════════════════════════════════════════════════════════

const create = async (data: CreateAnalisisDTO): Promise<AnalisisDTO> => {
  return HttpService.post(BASE, data) as Promise<AnalisisDTO>;
};

const getByParcela = async (
  parcelaId: string,
  tipo?: IndiceTipo,
  limit?: number,
): Promise<AnalisisDTO[]> => {
  return HttpService.get(BASE, {
    parcelaId,
    tipo,
    limit,
  }) as Promise<AnalisisDTO[]>;
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(`${BASE}/${id}`);
};

export const AnalisisRepository = {
  analyse,
  getTimeSeries,
  getIndices,
  create,
  getByParcela,
  remove,
};
