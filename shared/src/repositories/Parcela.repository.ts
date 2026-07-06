import { getBaseUrl } from "../services/Http.service.js";
import HttpService from "../services/Http.service.js";
import type {
  CreateParcelaDTO,
  UpdateParcelaDTO,
  ParcelaDTO,
} from "../dtos/Parcela.dto.js";

const BASE = (explotacionId: string) =>
  `${getBaseUrl()}/api/explotaciones/${explotacionId}/parcelas`;

const getAll = async (explotacionId: string): Promise<ParcelaDTO[]> => {
  return HttpService.get(BASE(explotacionId)) as Promise<ParcelaDTO[]>;
};

const getById = async (
  explotacionId: string,
  id: string,
): Promise<ParcelaDTO> => {
  return HttpService.get(`${BASE(explotacionId)}/${id}`) as Promise<ParcelaDTO>;
};

const create = async (
  explotacionId: string,
  data: CreateParcelaDTO,
): Promise<ParcelaDTO> => {
  return HttpService.post(BASE(explotacionId), data) as Promise<ParcelaDTO>;
};

const update = async (
  explotacionId: string,
  id: string,
  data: UpdateParcelaDTO,
): Promise<ParcelaDTO> => {
  return HttpService.patch(
    `${BASE(explotacionId)}/${id}`,
    data,
  ) as Promise<ParcelaDTO>;
};

const remove = async (explotacionId: string, id: string): Promise<void> => {
  await HttpService.delete(`${BASE(explotacionId)}/${id}`);
};

export const ParcelaRepository = {
  getAll,
  getById,
  create,
  update,
  remove,
};
