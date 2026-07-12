import type { FastifyReply, FastifyRequest } from "fastify";
import { EmailVerificationService } from "./EmailVerification.service.js";
import type { VerifyEmailRequest } from "./EmailVerification.interface.js";

const verify = async (request: VerifyEmailRequest, reply: FastifyReply) => {
  const { token } = request.body;
  await EmailVerificationService.verifyEmail(token);
  return reply.send({ message: "Email verificado correctamente" });
};

const resend = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  await EmailVerificationService.sendVerificationEmail(userId);
  return reply.send({ message: "Email de verificación reenviado" });
};

export const EmailVerificationController = { verify, resend };