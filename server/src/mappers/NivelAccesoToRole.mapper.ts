import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { ExplotacionAccessRole } from "@agrospace/shared/enums/ExplotacionAccessRole.enum";

const NIVEL_TO_ROLE_MAP: Record<NivelAcceso, ExplotacionAccessRole> = {
  [NivelAcceso.CONSULTA]: ExplotacionAccessRole.CONSULTA,
  [NivelAcceso.GESTION]: ExplotacionAccessRole.GESTION,
};

export const mapNivelAccesoToRole = (
  nivelAcceso: NivelAcceso,
): ExplotacionAccessRole => NIVEL_TO_ROLE_MAP[nivelAcceso];