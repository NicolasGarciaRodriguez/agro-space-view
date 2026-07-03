import config from "../config/index.config";
import HttpService from "../services/Http.service";
import type { InsightDTO } from "../dtos/Insight.dto";

const BASE = `${config.API_URL}/api/insights`;

const getByParcela = async (parcelaId: string): Promise<InsightDTO | null> => {
  try {
    return (await HttpService.get(
      `${BASE}/parcela/${parcelaId}`,
    )) as InsightDTO;
  } catch {
    return null; // 404 = sin insight todavía, no es un error real
  }
};

const getByExplotacion = async (explotacionId: string): Promise<InsightDTO> => {
  return HttpService.get(
    `${BASE}/explotacion/${explotacionId}`,
  ) as Promise<InsightDTO>;
};

export const InsightRepository = { getByParcela, getByExplotacion };
