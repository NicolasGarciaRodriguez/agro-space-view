import type { FastifyRequest } from "fastify";

export interface SearchImagesQuery {
  bbox: string;
  dateFrom: string;
  dateTo: string;
  maxCloud?: number;
  limit?: number;
}

export type SearchImagesRequest = FastifyRequest<{
  Querystring: SearchImagesQuery;
}>;

export interface STACItem {
  id: string;
  type: "Feature";
  geometry: {
    type: string;
    coordinates: number[][];
  };
  properties: {
    datetime: string;
    "eo:cloud_cover": number;
    platform: string;
  };
  assets: {
    thumbnail?: { href: string };
    B04?: { href: string };
    B08?: { href: string };
  };
}

export interface STACCollection {
  type: "FeatureCollection";
  features: STACItem[];
  numberMatched: number;
  numberReturned: number;
}

export interface ImageResult {
  id: string;
  date: string;
  cloudCover: number;
  thumbnail: string | undefined;
}

export interface SearchImagesResponse {
  items: ImageResult[];
  total: number;
}
