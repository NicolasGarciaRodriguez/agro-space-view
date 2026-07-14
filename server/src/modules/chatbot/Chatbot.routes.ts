import type { FastifyInstance, FastifyReply } from "fastify";
import { CHATBOT_ROUTE_PREFIX } from "./Chatbot.config.js";
import { ChatbotController } from "./Chatbot.controller.js";
import {
  ConversationNotFoundError,
  ConversationForbiddenError,
} from "./Chatbot.interface.js";
import { authenticate, requireVerifiedEmail } from "../../middleware/Auth.middleware.js";
import type {
  CreateConversationRequest,
  SendMessageRequest,
  GetConversationRequest,
  ListConversationsRequest,
  DeleteConversationRequest,
} from "./Chatbot.interface.js";
import { UsageLimitExceededError } from "../usageLimits/UsageLimits.interface.js";

export default function ChatbotRoutes(
  fastify: FastifyInstance,
  _options: unknown,
  done: (err?: Error) => void,
): void {
  fastify.addHook("onRequest", authenticate);
  fastify.addHook("onRequest", requireVerifiedEmail);

  fastify.post(
    `${CHATBOT_ROUTE_PREFIX}/conversations`,
    async (request: CreateConversationRequest, reply: FastifyReply) => {
      try {
        return await ChatbotController.create(request, reply);
      } catch (error) {
        if (error instanceof ConversationNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof ConversationForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.get(
    `${CHATBOT_ROUTE_PREFIX}/conversations`,
    async (request: ListConversationsRequest, reply: FastifyReply) => {
      try {
        return await ChatbotController.list(request, reply);
      } catch (error) {
        if (error instanceof ConversationNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof ConversationForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.get(
    `${CHATBOT_ROUTE_PREFIX}/conversations/:id`,
    async (request: GetConversationRequest, reply: FastifyReply) => {
      try {
        return await ChatbotController.getById(request, reply);
      } catch (error) {
        if (error instanceof ConversationNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.post(
    `${CHATBOT_ROUTE_PREFIX}/conversations/:id/messages`,
    async (request: SendMessageRequest, reply: FastifyReply) => {
      try {
        return await ChatbotController.sendMessage(request, reply);
      } catch (error) {
        if (error instanceof ConversationNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof ConversationForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        if (error instanceof UsageLimitExceededError) {
          return reply.status(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.delete(
    `${CHATBOT_ROUTE_PREFIX}/conversations/:id`,
    async (request: DeleteConversationRequest, reply: FastifyReply) => {
      try {
        return await ChatbotController.remove(request, reply);
      } catch (error) {
        if (error instanceof ConversationNotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  done();
}