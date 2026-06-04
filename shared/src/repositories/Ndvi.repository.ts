import config from "../config/index.config";
import HttpService from "../services/Http.service";
import type {
  AnalyseNdviParamsDTO,
  NdviAnalysisMetadataDTO,
  GetNdviTimeSeriesDTO,
  NdviTimeSeriesResponseDTO,
} from "../dtos/Ndvi.dto";

export interface NdviAnalysisResult {
  imageUrl: string;
  imageBase64: string;
  metadata: NdviAnalysisMetadataDTO;
}

const analyseNdvi = async (
  params: AnalyseNdviParamsDTO,
): Promise<NdviAnalysisResult> => {
  const res = await HttpService.postBlob(
    `${config.API_URL}/api/ndvi/analyse`,
    params,
  );

  const metadata: NdviAnalysisMetadataDTO = {
    usedImageId: res.headers.get("X-Ndvi-Image-Id") ?? "",
    usedImageDate: res.headers.get("X-Ndvi-Image-Date") ?? "",
    cloudCover: Number(res.headers.get("X-Ndvi-Cloud-Cover") ?? 0),
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
  params: GetNdviTimeSeriesDTO,
): Promise<NdviTimeSeriesResponseDTO> => {
  return HttpService.get(`${config.API_URL}/api/ndvi/timeseries`, {
    bbox: params.bbox.join(","),
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    maxCloud: params.maxCloud,
  }) as Promise<NdviTimeSeriesResponseDTO>;
};

export const NdviRepository = {
  analyseNdvi,
  getTimeSeries,
};
