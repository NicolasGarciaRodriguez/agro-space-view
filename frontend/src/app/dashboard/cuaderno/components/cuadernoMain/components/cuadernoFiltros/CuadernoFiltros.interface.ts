import type { ParcelaDTO } from "@agrospace/shared/dtos/Parcela.dto";

export interface CuadernoFiltrosValue {
  parcelaId: string;
  tipo: string;
  dateFrom: string;
  dateTo: string;
}

export interface CuadernoFiltrosProps {
  parcelas: ParcelaDTO[];
  value: CuadernoFiltrosValue;
  onChange: (value: CuadernoFiltrosValue) => void;
}
