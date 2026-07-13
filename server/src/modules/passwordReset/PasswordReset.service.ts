import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { UserModel } from "../../schemas/User.schema.js";
import { ResendService } from "../../services/Resend.service.js";
import { BCRYPT_SALT_ROUNDS } from "../auth/Auth.config.js";
import {
  RESET_TOKEN_EXPIRY_HOURS,
  buildResetEmailHtml,
} from "./PasswordReset.config.js";
import { InvalidPasswordError, InvalidResetTokenError } from "./PasswordReset.interface.js";
import { isPasswordValid } from "@agrospace/shared/config/PasswordRules.config";

const generateToken = (): string => crypto.randomBytes(32).toString("hex");

// Por seguridad, NO revela si el email existe o no en la base de
// datos — siempre responde "vale" igual, tanto si encontró el
// usuario como si no. Así se evita que alguien use este endpoint
// para averiguar qué emails están registrados.
const requestReset = async (email: string): Promise<void> => {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return; // silencioso a propósito

  const token = generateToken();
  user.passwordResetToken = token;
  user.passwordResetExpires = new Date(
    Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = buildResetEmailHtml(user.nombre, resetUrl);

  await ResendService.sendEmail({
    to: user.email,
    subject: "Restablece tu contraseña — AgroSpaceView",
    html,
  });
};

const confirmReset = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  if (!isPasswordValid(newPassword)) {
    throw new InvalidPasswordError();
  }

  const user = await UserModel.findOne({ passwordResetToken: token });
  if (!user) throw new InvalidResetTokenError();

  if (
    !user.passwordResetExpires ||
    user.passwordResetExpires.getTime() < Date.now()
  ) {
    throw new InvalidResetTokenError();
  }

  user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
};

export const PasswordResetService = { requestReset, confirmReset };