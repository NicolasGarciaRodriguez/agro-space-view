import type { IndiceDefinitionDTO } from "@agrospace/shared/dtos/Analisis.dto";
import type { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";

export interface IndiceTipoSelectorProps {
  indices: IndiceDefinitionDTO[];
  tipoActivo: IndiceTipo;
  onChange: (tipo: IndiceTipo) => void;
  disabled?: boolean;
}