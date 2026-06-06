import { ExplotacionStatsDTO } from "@agrospace/shared/dtos/Explotacion.dto";

export interface DashboardStatsProps {
  totalParcelas: number;
  superficieTotal: number;
  stats: ExplotacionStatsDTO | null;
}
