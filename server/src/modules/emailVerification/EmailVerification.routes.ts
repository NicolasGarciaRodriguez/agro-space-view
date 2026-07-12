import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { EMAIL_VERIFICATION_ROUTE_PREFIX } from "./EmailVerification.config.js";
import { EmailVerificationController } from "./EmailVerification.controller.js";
import { InvalidTokenError, AlreadyVerifiedError } from "./EmailVerification.interface.js";
import { authenticate } from "../../middleware/Auth.middleware.js";
import type { VerifyEmailRequest } from "./EmailVerification.interface.js";

export default function EmailVerificationRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.post(
    `${EMAIL_VERIFICATION_ROUTE_PREFIX}/verify`,
    async (request: VerifyEmailRequest, reply: FastifyReply) => {
      try {
        console.log("verify", request.body);
        return await EmailVerificationController.verify(request, reply);
      } catch (error) {
        if (error instanceof InvalidTokenError) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  // Reenviar SÍ requiere sesión, porque necesitamos saber para quién
  fastify.register((instance, _opts, doneInner) => {
    instance.addHook("onRequest", authenticate);

    instance.post(
      `${EMAIL_VERIFICATION_ROUTE_PREFIX}/resend`,
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          return await EmailVerificationController.resend(request, reply);
        } catch (error) {
          if (error instanceof AlreadyVerifiedError) {
            return reply.status(400).send({ error: error.message });
          }
          throw error;
        }
      },
    );

    doneInner();
  });

  done();
}