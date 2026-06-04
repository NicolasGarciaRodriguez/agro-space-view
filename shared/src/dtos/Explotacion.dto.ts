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
