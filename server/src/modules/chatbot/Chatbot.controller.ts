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

  // El cupo de chatbot es de la explotación, medido contra el plan
  // de su dueño — no contra quien escribe el mensaje.
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

const remove = async (
  request: DeleteConversationRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id } = request.params;

  await ChatbotService.removeConversation(userId, id);
  return reply.status(204).send();
};

export const ChatbotController = { create, getById, list, sendMessage, remove };