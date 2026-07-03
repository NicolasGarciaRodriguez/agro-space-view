import type { FastifyRequest } from "fastify";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";

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

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellidos: string;
    role: UserRole;
    plan: UserPlan;
  };
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
