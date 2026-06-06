import config from "../config/index.config";
import HttpService from "../services/Http.service";
import type {
  CreateExplotacionDTO,
  UpdateExplotacionDTO,
  ExplotacionDTO,
  ExplotacionStatsDTO,
} from "../dtos/Explotacion.dto";

const BASE = `${config.API_URL}/api/explotaciones`;

const getAll = async (): Promise<ExplotacionDTO[]> => {
  return HttpService.get(BASE) as Promise<ExplotacionDTO[]>;
};

const getById = async (id: string): Promise<ExplotacionDTO> => {
  return HttpService.get(`${BASE}/${id}`) as Promise<ExplotacionDTO>;
};

const create = async (data: CreateExplotacionDTO): Promise<ExplotacionDTO> => {
  return HttpService.post(BASE, data) as Promise<ExplotacionDTO>;
};

const update = async (
  id: string,
  data: UpdateExplotacionDTO,
): Promise<ExplotacionDTO> => {
  return HttpService.patch(`${BASE}/${id}`, data) as Promise<ExplotacionDTO>;
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(`${BASE}/${id}`);
};

const getStats = async (id: string): Promise<ExplotacionStatsDTO> => {
  return HttpService.get(`${BASE}/${id}/stats`) as Promise<ExplotacionStatsDTO>;
};

export const ExplotacionRepository = {
  getAll,
  getById,
  create,
  update,
  remove,
  getStats,
};
