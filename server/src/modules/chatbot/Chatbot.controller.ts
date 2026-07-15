import type { FastifyReply } from "fastify";
import { ChatbotService } from "./Chatbot.service.js";
import {
  ConversationNotFoundError,
  ConversationForbiddenError,
  type CreateConversationRequest,
  type SendMessageRequest,
  type GetConversationRequest,
  type ListConversationsRequest,
  type DeleteConversationRequest,
} from "./Chatbot.interface.js";
import { UsageLimitsService } from "../usageLimits/UsageLimits.service.js";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";
import { UserModel } from "../../schemas/User.schema.js";
import { ExplotacionAccessService } from "../../services/explotacionAccess/ExplotacionAccess.service.js";
import {
  ExplotacionAccessDeniedError,
  ExplotacionNotFoundForAccessError,
} from "../../services/explotacionAccess/ExplotacionAccess.interface.js";

const translateAccessError = (error: unknown): never => {
  if (error instanceof ExplotacionNotFoundForAccessError) {
    throw new ConversationNotFoundError();
  }
  if (error instanceof ExplotacionAccessDeniedError) {
    throw new ConversationForbiddenError();
  }
  throw error;
};

const create = async (
  request: CreateConversationRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { explotacionId, parcelaId } = request.body;

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      explotacionId,
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const conversation = await ChatbotService.createConversation(
    userId,
    explotacionId,
    parcelaId ?? null,
  );

  return reply.status(201).send(conversation);
};

const getById = async (
  request: GetConversationRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id } = request.params;

  const conversation = await ChatbotService.getConversation(userId, id);
  return reply.send(conversation);
};

const list = async (request: ListConversationsRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId } = request.query;

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      explotacionId,
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const conversations = await ChatbotService.listConversations(
    userId,
    explotacionId,
  );
  return reply.send(conversations);
};

const sendMessage = async (
  request: SendMessageRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id } = request.params;
  const { message } = request.body;

  const conversation = await ChatbotService.getConversation(userId, id);

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      conversation.explotacionId.toString(),
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  await UsageLimitsService.assertNotRateLimited(userId);

  const explotacion = await ExplotacionModel.findById(
    conversation.explotacionId,
  ).lean();
  if (!explotacion) throw new ConversationNotFoundError();

  const dueño = await UserModel.findById(explotacion.userId).lean();
  if (!dueño) throw new ConversationNotFoundError();

  await UsageLimitsService.assertCanSendChatbotMessage(
    explotacion._id.toString(),
    dueño.plan,
    dueño.role === UserRole.ADMIN,
  );

  const updated = await ChatbotService.sendMessage(
    userId,
    conversation.explotacionId.toString(),
    id,
    message,
  );

  return reply.send(updated);
};

const sendMessageStream = async (
  request: SendMessageRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id } = request.params;
  const { message } = request.body;

  const conversation = await ChatbotService.getConversation(userId, id);

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      conversation.explotacionId.toString(),
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  await UsageLimitsService.assertNotRateLimited(userId);

  const explotacion = await ExplotacionModel.findById(
    conversation.explotacionId,
  ).lean();
  if (!explotacion) throw new ConversationNotFoundError();

  const dueño = await UserModel.findById(explotacion.userId).lean();
  if (!dueño) throw new ConversationNotFoundError();

  await UsageLimitsService.assertCanSendChatbotMessage(
    explotacion._id.toString(),
    dueño.plan,
    dueño.role === UserRole.ADMIN,
  );

  const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  const requestOrigin = request.headers.origin;
  const allowedOrigin =
    requestOrigin && corsOrigins.includes(requestOrigin.replace(/\/$/, ""))
      ? requestOrigin
      : corsOrigins[0];

  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
  });

  const sendEvent = (event: string, data: unknown) => {
    reply.raw.write(`event: ${event}\n`);
    reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const updated = await ChatbotService.sendMessageStream(
      userId,
      conversation.explotacionId.toString(),
      id,
      message,
      (token) => sendEvent("token", { token }),
    );

    sendEvent("done", { conversation: updated });
  } catch (error) {
    sendEvent("error", {
      message:
        error instanceof Error
          ? error.message
          : "Error al generar la respuesta.",
    });
  } finally {
    reply.raw.end();
  }
};

const remove = async (
  request: DeleteConversationRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id } = request.params;

  await ChatbotService.removeConversation(userId, id);
  return reply.status(204).send();
};

export const ChatbotController = { create, getById, list, sendMessage, sendMessageStream, remove };