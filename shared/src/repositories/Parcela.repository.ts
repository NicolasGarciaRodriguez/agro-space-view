import config from "../config/index.config.js";
import HttpService from "../services/Http.service.js";
import type {
  CreateParcelaDTO,
  UpdateParcelaDTO,
  ParcelaDTO,
} from "../dtos/Parcela.dto.js";

const base = (explotacionId: string) =>
  `${config.API_URL}/api/explotaciones/${explotacionId}/parcelas`;

const getAll = async (explotacionId: string): Promise<ParcelaDTO[]> => {
  return HttpService.get(base(explotacionId)) as Promise<ParcelaDTO[]>;
};

const getById = async (
  explotacionId: string,
  id: string,
): Promise<ParcelaDTO> => {
  return HttpService.get(`${base(explotacionId)}/${id}`) as Promise<ParcelaDTO>;
};

const create = async (
  explotacionId: string,
  data: CreateParcelaDTO,
): Promise<ParcelaDTO> => {
  return HttpService.post(base(explotacionId), data) as Promise<ParcelaDTO>;
};

const update = async (
  explotacionId: string,
  id: string,
  data: UpdateParcelaDTO,
): Promise<ParcelaDTO> => {
  return HttpService.patch(
    `${base(explotacionId)}/${id}`,
    data,
  ) as Promise<ParcelaDTO>;
};

const remove = async (explotacionId: string, id: string): Promise<void> => {
  await HttpService.delete(`${base(explotacionId)}/${id}`);
};

export const ParcelaRepository = {
  getAll,
  getById,
  create,
  update,
  remove,
};
