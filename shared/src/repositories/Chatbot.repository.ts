import config from "../config/index.config.js";
import HttpService from "../services/Http.service.js";
import type {
  ConversationDTO,
  ConversationSummaryDTO,
  CreateConversationDTO,
  SendMessageDTO,
} from "../dtos/Chatbot.dto.js";

const BASE = `${config.API_URL}/api/chatbot/conversations`;

const create = async (
  data: CreateConversationDTO,
): Promise<ConversationDTO> => {
  return HttpService.post(BASE, data) as Promise<ConversationDTO>;
};

const list = async (
  explotacionId: string,
): Promise<ConversationSummaryDTO[]> => {
  return HttpService.get(BASE, { explotacionId }) as Promise<
    ConversationSummaryDTO[]
  >;
};

const getById = async (id: string): Promise<ConversationDTO> => {
  return HttpService.get(`${BASE}/${id}`) as Promise<ConversationDTO>;
};

const sendMessage = async (
  id: string,
  data: SendMessageDTO,
): Promise<ConversationDTO> => {
  return HttpService.post(
    `${BASE}/${id}/messages`,
    data,
  ) as Promise<ConversationDTO>;
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(`${BASE}/${id}`);
};

export const ChatbotRepository = { create, list, getById, sendMessage, remove };
