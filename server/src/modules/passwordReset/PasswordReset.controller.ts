import type { FastifyReply } from "fastify";
import { PasswordResetService } from "./PasswordReset.service.js";
import type {
  RequestResetRequest,
  ConfirmResetRequest,
} from "./PasswordReset.interface.js";

const requestReset = async (
  request: RequestResetRequest,
  reply: FastifyReply,
) => {
  const { email } = request.body;
  await PasswordResetService.requestReset(email);
  // Mensaje genérico siempre, exista o no el email — coherente con
  // la lógica silenciosa del service.
  return reply.send({
    message: "Si el email existe, recibirás un enlace para restablecer tu contraseña",
  });
};

const confirmReset = async (
  request: ConfirmResetRequest,
  reply: FastifyReply,
) => {
  const { token, newPassword } = request.body;
  await PasswordResetService.confirmReset(token, newPassword);
  return reply.send({ message: "Contraseña actualizada correctamente" });
};

export const PasswordResetController = { requestReset, confirmReset };