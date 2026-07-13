import type { FastifyInstance, FastifyReply } from "fastify";
import { PASSWORD_RESET_ROUTE_PREFIX } from "./PasswordReset.config.js";
import { PasswordResetController } from "./PasswordReset.controller.js";
import { InvalidResetTokenError } from "./PasswordReset.interface.js";
import type {
  RequestResetRequest,
  ConfirmResetRequest,
} from "./PasswordReset.interface.js";

// Ambas rutas son públicas — el usuario, por definición, no tiene
// sesión iniciada cuando ha olvidado su contraseña.
export default function PasswordResetRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.post(
    `${PASSWORD_RESET_ROUTE_PREFIX}/request`,
    async (request: RequestResetRequest, reply: FastifyReply) => {
      return PasswordResetController.requestReset(request, reply);
    },
  );

  fastify.post(
    `${PASSWORD_RESET_ROUTE_PREFIX}/confirm`,
    async (request: ConfirmResetRequest, reply: FastifyReply) => {
      try {
        return await PasswordResetController.confirmReset(request, reply);
      } catch (error) {
        if (error instanceof InvalidResetTokenError) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  done();
}