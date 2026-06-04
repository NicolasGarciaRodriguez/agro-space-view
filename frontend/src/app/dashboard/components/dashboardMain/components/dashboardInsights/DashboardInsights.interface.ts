import { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";
import { ExplotacionDTO } from "@agrospace/shared/dtos/Explotacion.dto";

export interface DashboardInsightsProps {
  explotacion: ExplotacionDTO | null;
  parcelas: ParcelaDTO[];
}
