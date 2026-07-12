import type { FastifyRequest } from "fastify";

export interface VerifyEmailBody {
  token: string;
}

export type VerifyEmailRequest = FastifyRequest<{ Body: VerifyEmailBody }>;

export class InvalidTokenError extends Error {
  constructor() {
    super("El enlace de verificación no es válido o ha caducado");
    this.name = "InvalidTokenError";
  }
}

export class AlreadyVerifiedError extends Error {
  constructor() {
    super("Este email ya ha sido verificado");
    this.name = "AlreadyVerifiedError";
  }
}