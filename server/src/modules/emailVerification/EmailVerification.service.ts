import crypto from "node:crypto";
import { UserModel } from "../../schemas/User.schema.js";
import { EmailVerificationStatus } from "@agrospace/shared/enums/EmailVerificationStatus.enum";
import { ResendService } from "../../services/Resend.service.js";
import { TOKEN_EXPIRY_HOURS, buildVerificationEmailHtml } from "./EmailVerification.config.js";
import { InvalidTokenError, AlreadyVerifiedError } from "./EmailVerification.interface.js";

const generateToken = (): string => crypto.randomBytes(32).toString("hex");

const sendVerificationEmail = async (userId: string): Promise<void> => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  if (user.emailVerificationStatus === EmailVerificationStatus.VERIFICADO) {
    throw new AlreadyVerifiedError();
  }

  const token = generateToken();
  user.emailVerificationToken = token;
  user.emailVerificationExpires = new Date(
    Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );
  await user.save();

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = buildVerificationEmailHtml(user.nombre, verificationUrl);

  await ResendService.sendEmail({
    to: user.email,
    subject: "Verifica tu email — AgroSpaceView",
    html,
  });
};

// Valida el token y marca el email como verificado
const verifyEmail = async (token: string): Promise<void> => {
  const user = await UserModel.findOne({ emailVerificationToken: token });

  if (!user) throw new InvalidTokenError();

  if (
    !user.emailVerificationExpires ||
    user.emailVerificationExpires.getTime() < Date.now()
  ) {
    throw new InvalidTokenError();
  }

  user.emailVerificationStatus = EmailVerificationStatus.VERIFICADO;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
};

export const EmailVerificationService = { sendVerificationEmail, verifyEmail };