import { ExplotacionAccessRole } from "../enums/ExplotacionAccessRole.enum.js";

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
  nivelAcceso: ExplotacionAccessRole;
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
  parcelasEnBuenEstado: number;
  ultimoAnalisis: string | null;
  diasSinAnalizar: number | null;
  parcelaMejor: ParcelaStatDTO | null;
  parcelaPeor: ParcelaStatDTO | null;
}