import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";

export const NIVEL_RANK: Record<NivelAcceso, number> = {
  [NivelAcceso.CONSULTA]: 1,
  [NivelAcceso.GESTION]: 2,
};