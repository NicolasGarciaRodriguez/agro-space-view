import config from "../config/index.config.js";
import HttpService from "../services/Http.service.js";
import type {
  GetParcelByRefDTO,
  GetParcelByCoordsDTO,
  CadastralParcelDTO,
} from "../dtos/Catastro.dto.js";

const getParcelByRef = async (
  params: GetParcelByRefDTO,
): Promise<CadastralParcelDTO> => {
  return HttpService.get(`${config.API_URL}/api/catastro/parcel`, {
    ref: params.ref,
  }) as Promise<CadastralParcelDTO>;
};

const getParcelByCoords = async (
  params: GetParcelByCoordsDTO,
): Promise<CadastralParcelDTO> => {
  return HttpService.get(`${config.API_URL}/api/catastro/parcel/coords`, {
    lat: params.lat,
    lon: params.lon,
  }) as Promise<CadastralParcelDTO>;
};

export const CatastroRepository = {
  getParcelByRef,
  getParcelByCoords,
};
