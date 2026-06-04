import { CopernicusAuthService } from "../../services/CopernicusAuth.service.js";
import { STAC_BASE_URL, STAC_COLLECTION } from "./Stac.config.js";
import type {
  SearchImagesQuery,
  STACCollection,
  STACItem,
  ImageResult,
  SearchImagesResponse,
} from "./Stac.interface.js";

const toImageResult = (f: STACItem): ImageResult => ({
  id: f.id,
  date: f.properties.datetime,
  cloudCover: f.properties["eo:cloud_cover"],
  thumbnail: f.assets?.thumbnail?.href,
});

const searchImages = async (
  query: SearchImagesQuery,
): Promise<SearchImagesResponse> => {
  const { bbox, dateFrom, dateTo, maxCloud = 20, limit = 10 } = query;

  const bboxArray = bbox.split(",").map(Number);

  const body = {
    collections: [STAC_COLLECTION],
    bbox: bboxArray,
    datetime: `${dateFrom}T00:00:00Z/${dateTo}T23:59:59Z`,
    limit,
    filter: {
      op: "<",
      args: [{ property: "eo:cloud_cover" }, maxCloud],
    },
    "filter-lang": "cql2-json",
  };

  const res = await fetch(`${STAC_BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`STAC API error: ${res.status} - ${error}`);
  }

  const data = (await res.json()) as STACCollection;

  return {
    items: data.features.map(toImageResult),
    total: data.numberMatched,
  };
};

const downloadProduct = async (productId: string): Promise<Response> => {
  const token = await CopernicusAuthService.getToken();

  const url =
    `https://zipper.dataspace.copernicus.eu/odata/v1/` +
    `Products(${productId})/$value`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Error descargando producto ${productId}: ${res.status} ${res.statusText}`,
    );
  }

  return res;
};

export const StacService = {
  searchImages,
  downloadProduct,
};
