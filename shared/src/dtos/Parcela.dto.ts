import { TipoCultivo } from "../enums/TipoCultivo.enum";
import { ManejoCultivo } from "../enums/ManejoCultivo.enum";

export type LonLat = [number, number];

export interface CreateParcelaDTO {
  nombre: string;
  refCatastral: string;
  tipoCultivo?: TipoCultivo;
  variedad?: string;
  manejo?: ManejoCultivo;
}

export interface UpdateParcelaDTO {
  nombre?: string;
  tipoCultivo?: TipoCultivo;
  variedad?: string;
  manejo?: ManejoCultivo;
}

export interface ParcelaDTO {
  _id: string;
  userId: string;
  explotacionId: string;
  nombre: string;
  refCatastral: string;
  tipoCultivo?: TipoCultivo;
  variedad?: string;
  manejo: ManejoCultivo;
  provincia: string;
  municipio: string;
  superficie: number;
  description?: string;
  center: LonLat;
  bbox: [number, number, number, number];
  polygon: LonLat[];
  createdAt: string;
  updatedAt: string;
}
