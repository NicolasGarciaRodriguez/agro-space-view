import type { CuadernoEntradaDTO } from "@agrospace/shared/dtos/CuadernoEntrada.dto";
import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";

export type CuadernoCardVariant = "default" | "nested";

export interface CuadernoCardProps {
  entrada: CuadernoEntradaDTO;
  confirmDeleteId: string | null;
  onEdit: () => void;
  onDeleteClick: () => void;
  variant?: CuadernoCardVariant;
  parcela?: ParcelaDTO;
  onParcelaClick?: () => void;
}
