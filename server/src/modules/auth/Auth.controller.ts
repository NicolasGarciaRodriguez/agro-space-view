import bcrypt from "bcrypt";
import type { FastifyReply } from "fastify";
import { BCRYPT_SALT_ROUNDS, JWT_EXPIRY } from "./Auth.config.js";
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  type LogInRequest,
  type RegistrationRequest,
  type GetMeRequest,
  type AuthResponse,
  type AuthUserResponse,
  type JWTPayload,
} from "./Auth.interface.js";
import { UserModel } from "../../schemas/User.schema.js";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";
import { EmailVerificationService } from "../emailVerification/EmailVerification.service.js";
import { isPasswordValid } from "@agrospace/shared/config/PasswordRules.config";

// Construye la forma AuthUserResponse a partir del documento de Mongo,
// evitando repetir el mapeo campo a campo en cada handler.
const toAuthUserResponse = (user: {
  _id: unknown;
  email: string;
  nombre: string;
  apellidos: string;
  role: UserRole;
  plan: UserPlan;
  emailVerificationStatus: AuthUserResponse["emailVerificationStatus"];
  emailVerificationDeadline: Date;
}): AuthUserResponse => ({
  id: String(user._id),
  email: user.email,
  nombre: user.nombre,
  apellidos: user.apellidos,
  role: user.role,
  plan: user.plan,
  emailVerificationStatus: user.emailVerificationStatus,
  emailVerificationDeadline: user.emailVerificationDeadline,
});

const registration = async (
  request: RegistrationRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { email, password, nombre, apellidos, telefono } = request.body;

  if (!isPasswordValid(password)) {
    return reply.status(400).send({
      error: "La contraseña no cumple los requisitos mínimos de seguridad",
    });
  }

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) throw new EmailAlreadyExistsError();

  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const user = await UserModel.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    nombre,
    apellidos,
    telefono,
    role: UserRole.USUARIO,
    plan: UserPlan.GRATIS,
  });

  EmailVerificationService.sendVerificationEmail(user._id.toString()).catch(
    (error) => {
      console.error("Error enviando email de verificación:", error);
    },
  );

  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    plan: user.plan,
  };

  const token = await reply.jwtSign(payload, { expiresIn: JWT_EXPIRY });

  const response: AuthResponse = {
    token,
    user: toAuthUserResponse(user),
  };

  return reply.status(201).send(response);
};

const logIn = async (
  request: LogInRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { email, password } = request.body;

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) throw new InvalidCredentialsError();

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new InvalidCredentialsError();

  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    plan: user.plan,
  };

  const token = await reply.jwtSign(payload, { expiresIn: JWT_EXPIRY });

  const response: AuthResponse = {
    token,
    user: toAuthUserResponse(user),
  };

  return reply.send(response);
};

// Devuelve el usuario actual fresco desde Mongo — usado por el
// frontend para refrescar el store tras cambios de estado (por
// ejemplo, verificar el email en otra pestaña o desde el enlace).
const getMe = async (
  request: GetMeRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { userId } = request.user;

  const user = await UserModel.findById(userId).lean();
  if (!user) throw new UserNotFoundError();

  return reply.send(toAuthUserResponse(user));
};

export const AuthController = { logIn, registration, getMe };