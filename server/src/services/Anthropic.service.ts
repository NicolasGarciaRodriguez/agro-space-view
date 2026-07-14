import Anthropic from "@anthropic-ai/sdk";
import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";
import { AnthropicContentBlockType } from "@agrospace/shared/enums/AnthropicContentBlockType.enum";

let client: Anthropic | null = null;

const getClient = (): Anthropic => {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY no configurada");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
};

interface GenerateJSONParams {
  model: string;
  maxTokens: number;
  systemPrompt: string;
  userPrompt: string;
}

const generateJSON = async <T>(params: GenerateJSONParams): Promise<T> => {
  const { model, maxTokens, systemPrompt, userPrompt } = params;

  const response = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: ChatRole.USER, content: userPrompt }],
  });

  const textBlock = response.content.find(
    (block: Anthropic.ContentBlock) =>
      block.type === AnthropicContentBlockType.TEXT,
  );
  if (!textBlock || textBlock.type !== AnthropicContentBlockType.TEXT) {
    throw new Error("Respuesta de Anthropic sin contenido de texto");
  }

  const cleaned = textBlock.text.replace(/```json\s*|\s*```/g, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `Respuesta de Anthropic no es JSON válido: ${cleaned.slice(0, 200)}`,
    );
  }
};

// ═══════════════════════════════════════════════════════════════════
//  TOOL USE — para el chatbot
// ═══════════════════════════════════════════════════════════════════

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface AnthropicMessage {
  role: ChatRole;
  content:
    | string
    | Array<
        | { type: AnthropicContentBlockType.TEXT; text: string }
        | {
            type: AnthropicContentBlockType.TOOL_USE;
            id: string;
            name: string;
            input: Record<string, unknown>;
          }
        | {
            type: AnthropicContentBlockType.TOOL_RESULT;
            tool_use_id: string;
            content: string;
          }
      >;
}

interface GenerateWithToolsParams {
  model: string;
  maxTokens: number;
  systemPrompt: string;
  messages: AnthropicMessage[];
  tools: AnthropicTool[];
  executeTool: (
    toolName: string,
    input: Record<string, unknown>,
  ) => Promise<string>;
}

export interface GenerateWithToolsResult {
  finalText: string;
  toolCalls: Array<{ tool: string; input: Record<string, unknown> }>;
}

const generateWithTools = async (
  params: GenerateWithToolsParams,
): Promise<GenerateWithToolsResult> => {
  const { model, maxTokens, systemPrompt, tools, executeTool } = params;
  const messages = [...params.messages];
  const toolCalls: Array<{ tool: string; input: Record<string, unknown> }> = [];

  const MAX_ITERATIONS = 5;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await getClient().messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages as Anthropic.MessageParam[],
      tools: tools as Anthropic.Tool[],
    });

    if (response.stop_reason !== "tool_use") {
      const textBlock = response.content.find(
        (b: Anthropic.ContentBlock) =>
          b.type === AnthropicContentBlockType.TEXT,
      );
      const finalText =
        textBlock && textBlock.type === AnthropicContentBlockType.TEXT
          ? textBlock.text
          : "";
      return { finalText, toolCalls };
    }

    messages.push({
      role: ChatRole.ASSISTANT,
      content: response.content as AnthropicMessage["content"],
    });

    const toolUseBlocks = response.content.filter(
      (b: Anthropic.ContentBlock) =>
        b.type === AnthropicContentBlockType.TOOL_USE,
    );
    const toolResults: Array<{
      type: AnthropicContentBlockType.TOOL_RESULT;
      tool_use_id: string;
      content: string;
    }> = [];

    for (const block of toolUseBlocks) {
      if (block.type !== AnthropicContentBlockType.TOOL_USE) continue;

      const input = block.input as Record<string, unknown>;
      toolCalls.push({ tool: block.name, input });

      let result: string;
      try {
        result = await executeTool(block.name, input);
      } catch (error) {
        result = `Error ejecutando la herramienta: ${(error as Error).message}`;
      }

      toolResults.push({
        type: AnthropicContentBlockType.TOOL_RESULT,
        tool_use_id: block.id,
        content: result,
      });
    }

    messages.push({ role: ChatRole.USER, content: toolResults });
  }

  throw new Error("Se alcanzó el límite de iteraciones de herramientas");
};

export const AnthropicService = { generateJSON, generateWithTools };