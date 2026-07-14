import type { FastifyRequest } from "fastify";

export interface CreateConversationBody {
  explotacionId: string;
  parcelaId?: string;
}

export interface SendMessageBody {
  message: string;
}

export interface ConversationParams {
  id: string;
}

export interface ListConversationsQuery {
  explotacionId: string;
}

export type CreateConversationRequest = FastifyRequest<{
  Body: CreateConversationBody;
}>;

export type SendMessageRequest = FastifyRequest<{
  Params: ConversationParams;
  Body: SendMessageBody;
}>;

export type GetConversationRequest = FastifyRequest<{
  Params: ConversationParams;
}>;

export type ListConversationsRequest = FastifyRequest<{
  Querystring: ListConversationsQuery;
}>;

export type DeleteConversationRequest = FastifyRequest<{
  Params: ConversationParams;
}>;

export class ConversationNotFoundError extends Error {
  constructor() {
    super("Conversación no encontrada");
    this.name = "ConversationNotFoundError";
  }
}

export class ConversationForbiddenError extends Error {
  constructor() {
    super("No tienes permiso para acceder a esta conversación");
    this.name = "ConversationForbiddenError";
  }
}
