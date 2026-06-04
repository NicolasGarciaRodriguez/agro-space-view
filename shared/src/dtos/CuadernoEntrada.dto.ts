export type EntradaTipo =
  | "riego"
  | "fertilizacion"
  | "tratamiento"
  | "cosecha"
  | "observacion";

export interface EntradaDatosDTO {
  litrosPorM2?: number;
  horas?: number;
  metodo?: string;

  producto?: string;
  dosis?: number;
  unidad?: string;

  motivoTratamiento?: string;
  plaga?: string;

  kg?: number;
  calidad?: string;
  destino?: string;

  texto?: string;
}

export interface CreateEntradaDTO {
  parcelaId: string;
  explotacionId: string;
  fecha: string;
  tipo: EntradaTipo;
  datos: EntradaDatosDTO;
  notas?: string;
}

export interface UpdateEntradaDTO {
  fecha?: string;
  datos?: EntradaDatosDTO;
  notas?: string;
}

export interface CuadernoEntradaDTO {
  _id: string;
  userId: string;
  explotacionId: string;
  parcelaId: string;
  fecha: string;
  tipo: EntradaTipo;
  datos: EntradaDatosDTO;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetEntradasResponseDTO {
  entradas: CuadernoEntradaDTO[];
  total: number;
  page: number;
  totalPages: number;
}
