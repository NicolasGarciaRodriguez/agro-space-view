import { CopernicusAuthService } from "../../services/CopernicusAuth.service.js";
import { ImageResult } from "../stac/Stac.interface.js";
import { StacService } from "../stac/Stac.service.js";
import {
  SENTINEL_HUB_PROCESS_URL,
  SENTINEL_HUB_STATISTICS_URL,
  NDVI_OUTPUT,
  NDVI_EVALSCRIPT,
  NDVI_STATISTICS_EVALSCRIPT,
} from "./Ndvi.config.js";
import type {
  AnalyseNdviBody,
  SentinelHubProcessBody,
  NdviAnalysisMetadata,
  GetNdviTimeSeriesQuery,
  SHStatisticsResponse,
  NdviTimeSeriesPoint,
  NdviTimeSeriesResponse,
} from "./Ndvi.interface.js";

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
    width: NDVI_OUTPUT.width,
    height: NDVI_OUTPUT.height,
    responses: [
      { identifier: "default", format: { type: NDVI_OUTPUT.format } },
    ],
  },
  evalscript: NDVI_EVALSCRIPT,
});

const analyse = async (
  params: AnalyseNdviBody,
): Promise<{ image: Buffer; metadata: NdviAnalysisMetadata }> => {
  const { bbox, dateFrom, dateTo, maxCloud = 20 } = params;

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
  const body = buildProcessBody(bbox as number[], bestDate, maxCloud);

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
  const metadata: NdviAnalysisMetadata = {
    usedImageId: best.id,
    usedImageDate: best.date,
    cloudCover: best.cloudCover,
    bbox,
  };

  return { image: buffer, metadata };
};

const getTimeSeries = async (
  query: GetNdviTimeSeriesQuery,
): Promise<NdviTimeSeriesResponse> => {
  const { bbox: bboxStr, dateFrom, dateTo, maxCloud = 20 } = query;
  const bbox = parseBbox(bboxStr);
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
      evalscript: NDVI_STATISTICS_EVALSCRIPT,
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

  const points: NdviTimeSeriesPoint[] = data.data.map((item) => ({
    date: item.interval.from.split("T")[0],
    mean: round(item.outputs.ndvi.bands.B0.stats.mean),
    min: round(item.outputs.ndvi.bands.B0.stats.min),
    max: round(item.outputs.ndvi.bands.B0.stats.max),
  }));

  return { points, bbox, dateFrom, dateTo };
};

export class NoImagesFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoImagesFoundError";
  }
}

export const NdviService = { analyse, getTimeSeries };
