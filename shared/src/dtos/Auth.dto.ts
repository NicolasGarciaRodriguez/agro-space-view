import { UserRole } from "@agrospace/shared/enums/UserRole.enum";

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
