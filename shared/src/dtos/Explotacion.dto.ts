export interface CreateExplotacionDTO {
  nombre: string;
  provincia: string;
  municipio: string;
  descripcion?: string;
}

export interface UpdateExplotacionDTO {
  nombre?: string;
  provincia?: string;
  municipio?: string;
  descripcion?: string;
}

export interface ExplotacionDTO {
  _id: string;
  userId: string;
  nombre: string;
  provincia: string;
  municipio: string;
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParcelaStatDTO {
  nombre: string;
  ndvi: number;
}

export interface ExplotacionStatsDTO {
  totalParcelas: number;
  parcelasAnalizadas: number;
  ndviMedio: number | null;
  ultimoAnalisis: string | null;
  diasSinAnalizar: number | null;
  parcelaMejor: ParcelaStatDTO | null;
  parcelaPeor: ParcelaStatDTO | null;
}
