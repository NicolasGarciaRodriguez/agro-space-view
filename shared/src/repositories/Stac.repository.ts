import { getBaseUrl } from "../services/Http.service.js";
import HttpService from "../services/Http.service.js";
import { SearchImagesParamsDTO } from "../dtos/Stac.dto.js";

const BASE = () => `${getBaseUrl()}/api/stac/images`;

const searchImages = async (query: SearchImagesParamsDTO) => {
  const queryParams = {
    bbox: query.bbox,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    maxCloud: query.maxCloud,
    limit: query.limit,
  };
  return HttpService.get(`${BASE()}`, queryParams);
};

export const StacRepository = {
  searchImages,
};
