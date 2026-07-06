import { ManejoCultivo } from "../enums/ManejoCultivo.enum.js";

export const MANEJO_CULTIVO_LABELS: Record<ManejoCultivo, string> = {
  [ManejoCultivo.CONVENCIONAL]: "Convencional",
  [ManejoCultivo.EN_CONVERSION]: "En conversión a ecológico",
  [ManejoCultivo.ECOLOGICO]: "Ecológico certificado",
};
