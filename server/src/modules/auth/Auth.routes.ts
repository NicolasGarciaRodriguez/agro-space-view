import type { FastifyInstance, FastifyReply } from "fastify";
import { AUTH_ROUTE_PREFIX } from "./Auth.config.js";
import { AuthController } from "./Auth.controller.js";
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  type LogInRequest,
  type RegistrationRequest,
  type GetMeRequest,
} from "./Auth.interface.js";
import { authenticate } from "../../middleware/Auth.middleware.js";

export default function AuthRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.post(
    `${AUTH_ROUTE_PREFIX}/register`,
    async (request: RegistrationRequest, reply: FastifyReply) => {
      try {
        return await AuthController.registration(request, reply);
      } catch (error) {
        if (error instanceof EmailAlreadyExistsError) {
          return reply.status(409).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.post(
    `${AUTH_ROUTE_PREFIX}/login`,
    async (request: LogInRequest, reply: FastifyReply) => {
      try {
        return await AuthController.logIn(request, reply);
      } catch (error) {
        if (error instanceof InvalidCredentialsError) {
          return reply.status(401).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.register((instance, _opts, doneInner) => {
    instance.addHook("onRequest", authenticate);

    instance.get(
      `${AUTH_ROUTE_PREFIX}/me`,
      async (request: GetMeRequest, reply: FastifyReply) => {
        try {
          return await AuthController.getMe(request, reply);
        } catch (error) {
          if (error instanceof UserNotFoundError) {
            return reply.status(404).send({ error: error.message });
          }
          throw error;
        }
      },
    );

    doneInner();
  });

  done();
}