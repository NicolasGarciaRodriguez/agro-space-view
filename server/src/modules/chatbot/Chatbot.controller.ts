import type { FastifyReply } from "fastify";
import { ChatbotService } from "./Chatbot.service.js";
import type {
  CreateConversationRequest,
  SendMessageRequest,
  GetConversationRequest,
  ListConversationsRequest,
  DeleteConversationRequest,
} from "./Chatbot.interface.js";
import { UsageLimitsService } from "../usageLimits/UsageLimits.service.js";

const create = async (
  request: CreateConversationRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { explotacionId, parcelaId } = request.body;

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

  // Bloquea ANTES de llamar a Sonnet
  await UsageLimitsService.assertCanSendChatbotMessage(userId);

  const conversation = await ChatbotService.getConversation(userId, id);

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
