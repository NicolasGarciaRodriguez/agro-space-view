import type { FastifyInstance, FastifyReply } from "fastify";
import { EXPLOTACION_INVITATION_ROUTE_PREFIX } from "./ExplotacionInvitation.config.js";
import { ExplotacionInvitationController } from "./ExplotacionInvitation.controller.js";
import {
  InvitationNotFoundError,
  InvitationExpiredError,
  InvitationEmailMismatchError,
  InvitationForbiddenError,
  TooManyPendingInvitationsError,
  MemberNotFoundError,
  type CreateInvitationRequest,
  type AcceptInvitationRequest,
  type GetInvitationRequest,
  type RemoveMemberRequest,
  type GetMiembrosRequest,
} from "./ExplotacionInvitation.interface.js";
import { UsageLimitExceededError } from "../usageLimits/UsageLimits.interface.js";
import { authenticate, requireVerifiedEmail } from "../../middleware/Auth.middleware.js";

const handleErrors = (error: unknown, reply: FastifyReply) => {
  if (error instanceof InvitationNotFoundError) {
    return reply.status(404).send({ error: error.message });
  }
  if (error instanceof InvitationExpiredError) {
    return reply.status(410).send({ error: error.message });
  }
  if (error instanceof InvitationEmailMismatchError) {
    return reply.status(403).send({ error: error.message });
  }
  if (error instanceof InvitationForbiddenError) {
    return reply.status(403).send({ error: error.message });
  }
  if (error instanceof TooManyPendingInvitationsError) {
    return reply.status(429).send({ error: error.message });
  }
  if (error instanceof MemberNotFoundError) {
    return reply.status(404).send({ error: error.message });
  }
  if (error instanceof UsageLimitExceededError) {
    return reply.status(403).send({ error: error.message });
  }
  throw error;
};

export default function ExplotacionInvitationRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  // GET por token es la ÚNICA ruta pública (para mostrar el detalle
  // de la invitación antes de que el usuario inicie sesión).
  fastify.get(
    `${EXPLOTACION_INVITATION_ROUTE_PREFIX}/token/:token`,
    async (request: GetInvitationRequest, reply: FastifyReply) => {
      try {
        return await ExplotacionInvitationController.getByToken(
          request,
          reply,
        );
      } catch (error) {
        return handleErrors(error, reply);
      }
    },
  );

  // El resto requiere sesión y email verificado.
  fastify.register((instance, _opts, doneInner) => {
    instance.addHook("onRequest", authenticate);
    instance.addHook("onRequest", requireVerifiedEmail);

    instance.post(
      EXPLOTACION_INVITATION_ROUTE_PREFIX,
      async (request: CreateInvitationRequest, reply: FastifyReply) => {
        try {
          return await ExplotacionInvitationController.create(
            request,
            reply,
          );
        } catch (error) {
          return handleErrors(error, reply);
        }
      },
    );

    instance.post(
      `${EXPLOTACION_INVITATION_ROUTE_PREFIX}/:token/accept`,
      async (request: AcceptInvitationRequest, reply: FastifyReply) => {
        try {
          return await ExplotacionInvitationController.accept(
            request,
            reply,
          );
        } catch (error) {
          return handleErrors(error, reply);
        }
      },
    );

    instance.get(
      `${EXPLOTACION_INVITATION_ROUTE_PREFIX}/explotacion/:explotacionId/miembros`,
      async (request: GetMiembrosRequest, reply: FastifyReply) => {
        try {
          return await ExplotacionInvitationController.getMiembros(
            request,
            reply,
          );
        } catch (error) {
          return handleErrors(error, reply);
        }
      },
    );

    instance.delete(
      `${EXPLOTACION_INVITATION_ROUTE_PREFIX}/miembros/:miembroId`,
      async (request: RemoveMemberRequest, reply: FastifyReply) => {
        try {
          return await ExplotacionInvitationController.removeMember(
            request,
            reply,
          );
        } catch (error) {
          return handleErrors(error, reply);
        }
      },
    );

    doneInner();
  });

  done();
}