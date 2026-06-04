import type { FastifyRequest } from "fastify";

export interface AnalyseNdviBody {
  bbox: [number, number, number, number];
  dateFrom: string;
  dateTo: string;
  maxCloud?: number;
}

export type AnalyseNdviRequest = FastifyRequest<{
  Body: AnalyseNdviBody;
}>;

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

export interface NdviAnalysisMetadata {
  usedImageId: string;
  usedImageDate: string;
  cloudCover: number;
  bbox: [number, number, number, number];
}

export interface GetNdviTimeSeriesQuery {
  bbox: string;
  dateFrom: string;
  dateTo: string;
  maxCloud?: number;
}

export type GetNdviTimeSeriesRequest = FastifyRequest<{
  Querystring: GetNdviTimeSeriesQuery;
}>;

export interface SHStatisticsInterval {
  interval: { from: string; to: string };
  outputs: {
    ndvi: {
      bands: {
        B0: {
          stats: {
            min: number;
            max: number;
            mean: number;
            stDev: number;
            sampleCount: number;
            noDataCount: number;
          };
        };
      };
    };
  };
}

export interface SHStatisticsResponse {
  data: SHStatisticsInterval[];
  status: string;
  geometryPixelCount: number | null;
}

export interface NdviTimeSeriesPoint {
  date: string;
  mean: number;
  min: number;
  max: number;
}

export interface NdviTimeSeriesResponse {
  points: NdviTimeSeriesPoint[];
  bbox: [number, number, number, number];
  dateFrom: string;
  dateTo: string;
}
