import config from "../config/index.config.js";
import HttpService from "../services/Http.service.js";
import { SearchImagesParamsDTO } from "../dtos/Stac.dto.js";

const searchImages = async (query: SearchImagesParamsDTO) => {
  const queryParams = {
    bbox: query.bbox,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    maxCloud: query.maxCloud,
    limit: query.limit,
  };
  return HttpService.get(`${config.API_URL}/api/stac/images`, queryParams);
};

export const StacRepository = {
  searchImages,
};
