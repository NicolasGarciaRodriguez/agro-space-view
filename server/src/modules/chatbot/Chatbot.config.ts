import { ChatbotTool } from "@agrospace/shared/enums/ChatbotTool.enum";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import { EntradaTipo } from "@agrospace/shared/enums/EntradaTipo.enum";
import type { AnthropicTool } from "../../services/anthropic/Anthropic.interface.js";

export const CHATBOT_ROUTE_PREFIX = "/api/chatbot" as const;

export const CHATBOT_MODEL = "claude-sonnet-4-6" as const;

export const CHATBOT_MAX_TOKENS = 2048 as const;

export const CHATBOT_TOOLS: AnthropicTool[] = [
  {
    name: ChatbotTool.GET_HISTORIAL_PARCELA,
    description:
      "Obtiene el historial de análisis satelitales de una parcela concreta. Útil para responder preguntas sobre evolución temporal de un índice (NDVI, NDWI o NDRE) de una parcela específica.",
    input_schema: {
      type: "object",
      properties: {
        parcelaId: {
          type: "string",
          description: "ID de la parcela de la que se quiere el historial",
        },
        tipo: {
          type: "string",
          enum: Object.values(IndiceTipo),
          description:
            "Índice a consultar. Si no se especifica, se devuelven todos los índices disponibles.",
        },
      },
      required: ["parcelaId"],
    },
  },
  {
    name: ChatbotTool.GET_CUADERNO_PARCELA,
    description:
      "Obtiene las entradas del cuaderno de campo de una parcela (riegos, fertilizaciones, tratamientos, cosechas, observaciones). Útil para responder preguntas sobre qué se ha hecho en una parcela y cuándo.",
    input_schema: {
      type: "object",
      properties: {
        parcelaId: {
          type: "string",
          description: "ID de la parcela de la que se quiere el cuaderno",
        },
        tipoEntrada: {
          type: "string",
          enum: Object.values(EntradaTipo),
          description:
            "Tipo de entrada a filtrar. Si no se especifica, se devuelven todas.",
        },
      },
      required: ["parcelaId"],
    },
  },
  {
    name: ChatbotTool.GET_INSIGHT_PARCELA,
    description:
      "Obtiene el diagnóstico completo generado por IA de una parcela concreta, con hallazgos detallados y recomendación. Útil cuando el usuario pide profundizar en el estado o diagnóstico de una parcela específica.",
    input_schema: {
      type: "object",
      properties: {
        parcelaId: {
          type: "string",
          description: "ID de la parcela de la que se quiere el diagnóstico",
        },
      },
      required: ["parcelaId"],
    },
  },
];

export const CHATBOT_SYSTEM_PROMPT_TEMPLATE = (contextoLigero: string) =>
  `Eres el asistente agronómico de AgroSpaceView, una plataforma satelital para agricultores españoles. Ayudas al agricultor a entender el estado de sus parcelas y a tomar mejores decisiones de riego, fertilización y tratamiento.

CONTEXTO ACTUAL DE LA EXPLOTACIÓN:
${contextoLigero}

Tienes acceso a herramientas para consultar el historial detallado de análisis, el cuaderno de campo y los diagnósticos de IA de cualquier parcela cuando el usuario pregunte algo específico que no esté en el resumen de arriba.

Responde de forma técnica y profesional, pero cercana. Basa tus respuestas en los datos reales de la explotación cuando estén disponibles — si no tienes datos suficientes para responder algo concreto, dilo claramente en vez de inventar. Para preguntas agronómicas generales que no dependan de los datos de la explotación, puedes responder con tu conocimiento general.

Sé conciso. Las respuestas largas y con muchas secciones son difíciles de leer en un chat.` as const;
