import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";
import { EmailVerificationStatus } from "@agrospace/shared/enums/EmailVerificationStatus.enum";

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
  plan: UserPlan;
  emailVerificationStatus: EmailVerificationStatus;
  emailVerificationDeadline: string;
}

export interface AuthResponseDTO {
  token: string;
  user: AuthUserDTO;
}