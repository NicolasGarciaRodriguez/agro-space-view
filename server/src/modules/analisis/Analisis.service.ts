import { CopernicusAuthService } from "../../services/CopernicusAuth.service.js";
import { ImageResult } from "../stac/Stac.interface.js";
import { StacService } from "../stac/Stac.service.js";
import {
  SENTINEL_HUB_PROCESS_URL,
  SENTINEL_HUB_STATISTICS_URL,
  ANALISIS_OUTPUT,
  getIndiceDefinition,
  type IndiceDefinition,
} from "./Analisis.config.js";
import type {
  AnalyseBody,
  SentinelHubProcessBody,
  AnalysisMetadata,
  GetTimeSeriesQuery,
  SHStatisticsResponse,
  TimeSeriesPoint,
  TimeSeriesResponse,
} from "./Analisis.interface.ts";

const round = (n: number): number => Math.round(n * 1000) / 1000;

const parseBbox = (bbox: string): [number, number, number, number] => {
  const parts = bbox.split(",").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error("bbox inválido. Formato: west,south,east,north");
  }
  return parts as [number, number, number, number];
};

const pickBestImage = (items: ImageResult[]): ImageResult => {
  return items.reduce((best, current) =>
    current.cloudCover < best.cloudCover ? current : best,
  );
};

const buildProcessBody = (
  bbox: number[],
  date: string,
  maxCloud: number,
  definition: IndiceDefinition,
): SentinelHubProcessBody => ({
  input: {
    bounds: {
      bbox,
      properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
    },
    data: [
      {
        type: "sentinel-2-l2a",
        dataFilter: {
          timeRange: {
            from: `${date}T00:00:00Z`,
            to: `${date}T23:59:59Z`,
          },
          maxCloudCoverage: maxCloud,
        },
      },
    ],
  },
  output: {
    width: ANALISIS_OUTPUT.width,
    height: ANALISIS_OUTPUT.height,
    responses: [
      { identifier: "default", format: { type: ANALISIS_OUTPUT.format } },
    ],
  },
  evalscript: definition.imageEvalscript,
});

const analyse = async (
  params: AnalyseBody,
): Promise<{ image: Buffer; metadata: AnalysisMetadata }> => {
  const { tipo, bbox, dateFrom, dateTo, maxCloud = 20 } = params;

  const definition = getIndiceDefinition(tipo);

  const { items } = await StacService.searchImages({
    bbox: bbox.join(","),
    dateFrom,
    dateTo,
    maxCloud,
  });

  if (items.length === 0) {
    throw new NoImagesFoundError(
      `No hay imágenes disponibles para la zona entre ${dateFrom} y ${dateTo} con nubosidad menor a ${maxCloud}%`,
    );
  }

  const best = pickBestImage(items);
  const bestDate = best.date.split("T")[0];
  const token = await CopernicusAuthService.getToken();
  const body = buildProcessBody(
    bbox as number[],
    bestDate,
    maxCloud,
    definition,
  );

  const res = await fetch(SENTINEL_HUB_PROCESS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Sentinel Hub error: ${res.status} - ${error}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const metadata: AnalysisMetadata = {
    tipo,
    usedImageId: best.id,
    usedImageDate: best.date,
    cloudCover: best.cloudCover,
    bbox,
  };

  return { image: buffer, metadata };
};

const getTimeSeries = async (
  query: GetTimeSeriesQuery,
): Promise<TimeSeriesResponse> => {
  const { tipo, bbox: bboxStr, dateFrom, dateTo, maxCloud = 20 } = query;
  const bbox = parseBbox(bboxStr);
  const definition = getIndiceDefinition(tipo);
  const token = await CopernicusAuthService.getToken();

  const body = {
    input: {
      bounds: {
        bbox,
        properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: {
              from: `${dateFrom}T00:00:00Z`,
              to: `${dateTo}T23:59:59Z`,
            },
            maxCloudCoverage: maxCloud,
          },
        },
      ],
    },
    aggregation: {
      timeRange: {
        from: `${dateFrom}T00:00:00Z`,
        to: `${dateTo}T23:59:59Z`,
      },
      aggregationInterval: { of: "P1M" },
      width: 512,
      height: 512,
      evalscript: definition.statisticsEvalscript,
    },
  };

  const res = await fetch(SENTINEL_HUB_STATISTICS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Statistics API error: ${res.status} - ${error}`);
  }

  const data = (await res.json()) as SHStatisticsResponse;

  const points: TimeSeriesPoint[] = data.data.map((item) => ({
    date: item.interval.from.split("T")[0],
    mean: round(item.outputs.index.bands.B0.stats.mean),
    min: round(item.outputs.index.bands.B0.stats.min),
    max: round(item.outputs.index.bands.B0.stats.max),
  }));

  return { points, tipo, bbox, dateFrom, dateTo };
};

export class NoImagesFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoImagesFoundError";
  }
}

export const AnalisisService = { analyse, getTimeSeries };
