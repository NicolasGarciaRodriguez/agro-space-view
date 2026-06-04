import "@fastify/jwt";
import type { JWTPayload } from "../modules/auth/Auth.interface.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}
