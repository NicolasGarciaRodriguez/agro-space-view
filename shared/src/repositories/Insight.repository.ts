import { getBaseUrl } from "../services/Http.service.js";
import HttpService from "../services/Http.service.js";
import type { InsightDTO } from "../dtos/Insight.dto.js";

const BASE = () => `${getBaseUrl()}/api/insights`;

const getByParcela = async (parcelaId: string): Promise<InsightDTO | null> => {
  try {
    return (await HttpService.get(
      `${BASE()}/parcela/${parcelaId}`,
    )) as InsightDTO;
  } catch {
    return null; // 404 = sin insight todavía, no es un error real
  }
};

const getByExplotacion = async (explotacionId: string): Promise<InsightDTO> => {
  return HttpService.get(
    `${BASE()}/explotacion/${explotacionId}`,
  ) as Promise<InsightDTO>;
};

export const InsightRepository = { getByParcela, getByExplotacion };
