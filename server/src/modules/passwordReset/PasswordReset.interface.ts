import type { FastifyRequest } from "fastify";

export interface RequestResetBody {
  email: string;
}

export interface ConfirmResetBody {
  token: string;
  newPassword: string;
}

export type RequestResetRequest = FastifyRequest<{ Body: RequestResetBody }>;
export type ConfirmResetRequest = FastifyRequest<{ Body: ConfirmResetBody }>;

export class InvalidResetTokenError extends Error {
  constructor() {
    super("El enlace de restablecimiento no es válido o ha caducado");
    this.name = "InvalidResetTokenError";
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super("La contraseña no cumple los requisitos mínimos de seguridad");
    this.name = "InvalidPasswordError";
  }
}