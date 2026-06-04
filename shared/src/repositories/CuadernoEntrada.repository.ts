import config from "../config/index.config";
import HttpService from "../services/Http.service";
import type {
  CreateEntradaDTO,
  UpdateEntradaDTO,
  CuadernoEntradaDTO,
  EntradaTipo,
  GetEntradasResponseDTO,
} from "../dtos/CuadernoEntrada.dto";

const BASE = `${config.API_URL}/api/cuaderno`;

export interface GetEntradasParams {
  parcelaId?: string;
  explotacionId?: string;
  tipo?: EntradaTipo;
  limit?: number;
  page?: number;
}

const getAll = async (
  params?: GetEntradasParams,
): Promise<GetEntradasResponseDTO> => {
  return HttpService.get(BASE, {
    ...(params?.parcelaId && { parcelaId: params.parcelaId }),
    ...(params?.explotacionId && { explotacionId: params.explotacionId }),
    ...(params?.tipo && { tipo: params.tipo }),
    ...(params?.limit && { limit: params.limit }),
    ...(params?.page && { page: params.page }),
  }) as Promise<GetEntradasResponseDTO>;
};

const create = async (data: CreateEntradaDTO): Promise<CuadernoEntradaDTO> => {
  return HttpService.post(BASE, data) as Promise<CuadernoEntradaDTO>;
};

const update = async (
  id: string,
  data: UpdateEntradaDTO,
): Promise<CuadernoEntradaDTO> => {
  return HttpService.patch(
    `${BASE}/${id}`,
    data,
  ) as Promise<CuadernoEntradaDTO>;
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(`${BASE}/${id}`);
};

export const CuadernoEntradaRepository = {
  getAll,
  create,
  update,
  remove,
};
