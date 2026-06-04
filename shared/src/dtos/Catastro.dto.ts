export interface GetParcelByRefDTO {
  ref: string;
}

export interface GetParcelByCoordsDTO {
  lat: number;
  lon: number;
}

export type LonLat = [number, number];

export interface CadastralParcelDTO {
  ref: string;
  area: number;
  description: string;
  center: LonLat;
  bbox: [number, number, number, number];
  polygon: LonLat[];
}
