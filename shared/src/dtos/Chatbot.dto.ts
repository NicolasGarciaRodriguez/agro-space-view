import { ChatRole } from "../enums/ChatRole.enum";
import { ChatbotTool } from "../enums/ChatbotTool.enum";

export interface ChatToolCallDTO {
  tool: ChatbotTool;
  input: Record<string, unknown>;
}

export interface ChatMessageDTO {
  role: ChatRole;
  content: string;
  toolCalls?: ChatToolCallDTO[];
  createdAt: string;
}

export interface ConversationDTO {
  _id: string;
  userId: string;
  explotacionId: string;
  parcelaId: string | null;
  titulo: string;
  messages: ChatMessageDTO[];
  createdAt: string;
  updatedAt: string;
}

// Versión ligera para listar conversaciones (sin el array de mensajes)
export interface ConversationSummaryDTO {
  _id: string;
  titulo: string;
  parcelaId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationDTO {
  explotacionId: string;
  parcelaId?: string;
}

export interface SendMessageDTO {
  message: string;
}
