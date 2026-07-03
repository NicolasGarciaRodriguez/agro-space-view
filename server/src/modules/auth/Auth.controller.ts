import bcrypt from "bcrypt";
import type { FastifyReply } from "fastify";
import { BCRYPT_SALT_ROUNDS, JWT_EXPIRY } from "./Auth.config.js";
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  type LogInRequest,
  type RegistrationRequest,
  type AuthResponse,
  type JWTPayload,
} from "./Auth.interface.js";
import { UserModel } from "../../schemas/User.schema.js";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";

const registration = async (
  request: RegistrationRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { email, password, nombre, apellidos, telefono } = request.body;

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

  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    plan: user.plan,
  };

  const token = await reply.jwtSign(payload, { expiresIn: JWT_EXPIRY });

  const response: AuthResponse = {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      nombre: user.nombre,
      apellidos: user.apellidos,
      role: user.role,
      plan: user.plan,
    },
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
    user: {
      id: user._id.toString(),
      email: user.email,
      nombre: user.nombre,
      apellidos: user.apellidos,
      role: user.role,
      plan: user.plan,
    },
  };

  return reply.send(response);
};

export const AuthController = { logIn, registration };
