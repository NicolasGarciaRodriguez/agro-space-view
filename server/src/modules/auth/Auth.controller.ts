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
    role: "user",
  });

  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
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
    },
  };

  return reply.send(response);
};

export const AuthController = { logIn, registration };
