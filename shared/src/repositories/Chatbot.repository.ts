import HttpService from "../services/Http.service.js";
import type {
  ConversationDTO,
  ConversationSummaryDTO,
  CreateConversationDTO,
  SendMessageDTO,
} from "../dtos/Chatbot.dto.js";
import { getBaseUrl, getAuthToken } from "../services/Http.service.js";

const BASE = () => `${getBaseUrl()}/api/chatbot/conversations`;

const create = async (
  data: CreateConversationDTO,
): Promise<ConversationDTO> => {
  return HttpService.post(BASE(), data) as Promise<ConversationDTO>;
};

const list = async (
  explotacionId: string,
): Promise<ConversationSummaryDTO[]> => {
  return HttpService.get(BASE(), { explotacionId }) as Promise<ConversationSummaryDTO[]>;
};

const getById = async (id: string): Promise<ConversationDTO> => {
  return HttpService.get(`${BASE()}/${id}`) as Promise<ConversationDTO>;
};

const sendMessage = async (
  id: string,
  data: SendMessageDTO,
): Promise<ConversationDTO> => {
  return HttpService.post(
    `${BASE()}/${id}/messages`,
    data,
  ) as Promise<ConversationDTO>;
};

// Envía un mensaje y consume la respuesta en streaming (SSE). Llama
// a onToken por cada fragmento de texto que llega, y resuelve la
// promesa con la conversación completa cuando el servidor manda el
// evento "done". Si el servidor manda "error", rechaza la promesa.
const sendMessageStream = async (
  id: string,
  data: SendMessageDTO,
  onToken: (token: string) => void,
): Promise<ConversationDTO> => {
  const token = getAuthToken();

  const response = await fetch(`${BASE()}/${id}/messages/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok || !response.body) {
    const errorBody = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorBody.error ?? errorBody.message ?? "Error al enviar el mensaje",
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new Promise<ConversationDTO>((resolve, reject) => {
    const processBuffer = () => {
      // Los eventos SSE vienen separados por doble salto de línea.
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? ""; // el último trozo puede estar incompleto

      for (const rawEvent of events) {
        if (!rawEvent.trim()) continue;

        const lines = rawEvent.split("\n");
        const eventLine = lines.find((l) => l.startsWith("event: "));
        const dataLine = lines.find((l) => l.startsWith("data: "));
        if (!eventLine || !dataLine) continue;

        const eventName = eventLine.replace("event: ", "").trim();
        const payload = JSON.parse(dataLine.replace("data: ", ""));

        if (eventName === "token") {
          onToken(payload.token);
        } else if (eventName === "done") {
          resolve(payload.conversation);
        } else if (eventName === "error") {
          reject(new Error(payload.message ?? "Error al generar la respuesta."));
        }
      }
    };

    const pump = () => {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) return;
          buffer += decoder.decode(value, { stream: true });
          processBuffer();
          pump();
        })
        .catch(reject);
    };

    pump();
  });
};

const remove = async (id: string): Promise<void> => {
  await HttpService.delete(`${BASE()}/${id}`);
};

export const ChatbotRepository = {
  create,
  list,
  getById,
  sendMessage,
  sendMessageStream,
  remove,
};