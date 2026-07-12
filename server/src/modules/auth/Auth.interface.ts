import type { FastifyRequest } from "fastify";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";
import { EmailVerificationStatus } from "@agrospace/shared/enums/EmailVerificationStatus.enum";

export interface LogInBody {
  email: string;
  password: string;
}

export interface RegistrationBody {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
}

export type LogInRequest = FastifyRequest<{ Body: LogInBody }>;
export type RegistrationRequest = FastifyRequest<{ Body: RegistrationBody }>;
export type GetMeRequest = FastifyRequest;

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
}

// Forma común del usuario que se expone al frontend — reutilizada
// tanto en login/registro como en /me.
export interface AuthUserResponse {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  role: UserRole;
  plan: UserPlan;
  emailVerificationStatus: EmailVerificationStatus;
  emailVerificationDeadline: Date;
}

export interface AuthResponse {
  token: string;
  user: AuthUserResponse;
}

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("Ya existe una cuenta con ese email");
    this.name = "EmailAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Email o contraseña incorrectos");
    this.name = "InvalidCredentialsError";
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super("Usuario no encontrado");
    this.name = "UserNotFoundError";
  }
}