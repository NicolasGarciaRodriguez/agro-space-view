export type LonLat = [number, number];

export interface CreateParcelaDTO {
  nombre: string;
  refCatastral: string;
  cultivo?: string;
}

export interface UpdateParcelaDTO {
  nombre?: string;
  cultivo?: string;
}

export interface ParcelaDTO {
  _id: string;
  userId: string;
  explotacionId: string;
  nombre: string;
  refCatastral: string;
  cultivo?: string;
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
