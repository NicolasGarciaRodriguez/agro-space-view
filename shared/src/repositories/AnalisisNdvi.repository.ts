import config from "../config/index.config";
import HttpService from "../services/Http.service";
import type {
  CreateAnalisisNdviDTO,
  AnalisisNdviDTO,
} from "../dtos/AnalisisNdvi.dto";

const BASE = `${config.API_URL}/api/analisis/ndvi`;

const create = async (
  data: CreateAnalisisNdviDTO,
): Promise<AnalisisNdviDTO> => {
  return HttpService.post(BASE, data) as Promise<AnalisisNdviDTO>;
};

const getByParcela = async (
  parcelaId: string,
  limit?: number,
): Promise<AnalisisNdviDTO[]> => {
  return HttpService.get(BASE, {
    parcelaId,
    limit,
  }) as Promise<AnalisisNdviDTO[]>;
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(`${BASE}/${id}`);
};

export const AnalisisNdviRepository = {
  create,
  getByParcela,
  remove,
};
