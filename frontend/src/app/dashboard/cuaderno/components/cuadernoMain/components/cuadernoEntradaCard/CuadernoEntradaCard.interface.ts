import type { CuadernoEntradaDTO } from "@agrospace/shared/dtos/CuadernoEntrada.dto";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";

export interface CuadernoEntradaCardProps {
  entrada: CuadernoEntradaDTO;
  parcela: ParcelaDTO | undefined;
  confirmDeleteId: string | null;
  onEdit: () => void;
  onDeleteClick: () => void;
  onParcelaClick: () => void;
}
