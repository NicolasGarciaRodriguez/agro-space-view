import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";

export interface ParcelaCardProps {
  parcela: ParcelaDTO;
  onClick: () => void;
  onDelete: () => void;
}
