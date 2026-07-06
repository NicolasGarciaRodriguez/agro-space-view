import { getBaseUrl } from "../services/Http.service.js";
import HttpService from "../services/Http.service.js";
import type { InsightDTO, InsightOrMissingDTO } from "../dtos/Insight.dto.js";
import { IndiceTipo } from "../enums/IndiceTipo.enum.js";

const BASE = () => `${getBaseUrl()}/api/insights`;

const getByParcela = async (
  parcelaId: string,
): Promise<InsightOrMissingDTO> => {
  try {
    const insight = (await HttpService.get(
      `${BASE()}/parcela/${parcelaId}`,
    )) as InsightDTO;
    return { insight, faltantes: null };
  } catch (err) {
    const faltantes = (err as { faltantes?: IndiceTipo[] })?.faltantes ?? [];
    return { insight: null, faltantes };
  }
};

const getByExplotacion = async (explotacionId: string): Promise<InsightDTO> => {
  return HttpService.get(
    `${BASE()}/explotacion/${explotacionId}`,
  ) as Promise<InsightDTO>;
};

export const InsightRepository = { getByParcela, getByExplotacion };
