import type { UserRole } from "../types/auth.types";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
}

export interface AuthUserDTO {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  role: UserRole;
}

export interface AuthResponseDTO {
  token: string;
  user: AuthUserDTO;
}
