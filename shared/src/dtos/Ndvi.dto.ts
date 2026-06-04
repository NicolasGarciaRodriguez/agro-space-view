export interface AnalyseNdviParamsDTO {
  bbox: [number, number, number, number];
  dateFrom: string;
  dateTo: string;
  maxCloud?: number;
}

export interface NdviAnalysisMetadataDTO {
  usedImageId: string;
  usedImageDate: string;
  cloudCover: number;
  bbox: [number, number, number, number];
}

export interface GetNdviTimeSeriesDTO {
  bbox: [number, number, number, number];
  dateFrom: string;
  dateTo: string;
  maxCloud?: number;
}

export interface NdviTimeSeriesPointDTO {
  date: string;
  mean: number;
  min: number;
  max: number;
}

export interface NdviTimeSeriesResponseDTO {
  points: NdviTimeSeriesPointDTO[];
  bbox: [number, number, number, number];
  dateFrom: string;
  dateTo: string;
}
