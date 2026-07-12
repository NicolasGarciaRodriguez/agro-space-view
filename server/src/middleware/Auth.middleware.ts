import type { FastifyRequest, FastifyReply } from "fastify";
import { UserModel } from "../schemas/User.schema.js";
import { EmailVerificationStatus } from "@agrospace/shared/enums/EmailVerificationStatus.enum";

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ error: "No autorizado" });
  }
};

export const requireVerifiedEmail = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { userId } = request.user;

  const user = await UserModel.findById(userId, {
    emailVerificationStatus: 1,
    emailVerificationDeadline: 1,
  }).lean();

  if (!user) {
    return reply.status(401).send({ error: "No autorizado" });
  }

  if (user.emailVerificationStatus === EmailVerificationStatus.VERIFICADO) {
    return;
  }

  const deadlinePassed = user.emailVerificationDeadline.getTime() < Date.now();

  if (deadlinePassed) {
    return reply.status(403).send({
      error: "Debes verificar tu email para continuar usando la aplicación",
      code: "EMAIL_VERIFICATION_REQUIRED",
    });
  }
};