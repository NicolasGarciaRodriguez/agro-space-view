import { getBaseUrl } from "../services/Http.service.js";
import HttpService from "../services/Http.service.js";
import type {
  GetParcelByRefDTO,
  GetParcelByCoordsDTO,
  CadastralParcelDTO,
} from "../dtos/Catastro.dto.js";

const BASE = () => `${getBaseUrl()}/api/catastro`;

const getParcelByRef = async (
  params: GetParcelByRefDTO,
): Promise<CadastralParcelDTO> => {
  return HttpService.get(`${BASE()}/parcel`, {
    ref: params.ref,
  }) as Promise<CadastralParcelDTO>;
};

const getParcelByCoords = async (
  params: GetParcelByCoordsDTO,
): Promise<CadastralParcelDTO> => {
  return HttpService.get(`${BASE()}/parcel/coords`, {
    lat: params.lat,
    lon: params.lon,
  }) as Promise<CadastralParcelDTO>;
};

export const CatastroRepository = {
  getParcelByRef,
  getParcelByCoords,
};
