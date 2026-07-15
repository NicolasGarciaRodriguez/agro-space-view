import Anthropic from "@anthropic-ai/sdk";
import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";
import { AnthropicContentBlockType } from "@agrospace/shared/enums/AnthropicContentBlockType.enum";
import type {
  GenerateJSONParams,
  AnthropicMessage,
  GenerateWithToolsParams,
  GenerateWithToolsResult,
  GenerateWithToolsStreamParams,
  AnthropicContentBlock,
} from "./Anthropic.interface.js";

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

const generateJSON = async <T>(params: GenerateJSONParams): Promise<T> => {
  const { model, maxTokens, systemPrompt, userPrompt } = params;

  const response = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: ChatRole.USER, content: userPrompt }],
  });

  const textBlock = response.content.find(
    (block: AnthropicContentBlock) =>
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
        (b: AnthropicContentBlock) =>
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
      (b: AnthropicContentBlock) =>
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

// ═══════════════════════════════════════════════════════════════════
//  TOOL USE + STREAMING — para el chatbot con respuesta en vivo
// ═══════════════════════════════════════════════════════════════════

const generateWithToolsStream = async (
  params: GenerateWithToolsStreamParams,
): Promise<GenerateWithToolsResult> => {
  const { model, maxTokens, systemPrompt, tools, executeTool, onToken } = params;
  const messages = [...params.messages];
  const toolCalls: Array<{ tool: string; input: Record<string, unknown> }> = [];

  const MAX_ITERATIONS = 5;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const stream = getClient().messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages as Anthropic.MessageParam[],
      tools: tools as Anthropic.Tool[],
    });

    // Solo emitimos al callback los fragmentos de texto real — los
    // deltas de tool_use (JSON parcial de argumentos) no deben
    // mostrarse al usuario.
    stream.on("text", (textDelta: string) => {
      onToken(textDelta);
    });

    const finalMessage = await stream.finalMessage();

    if (finalMessage.stop_reason !== "tool_use") {
      const textBlock = finalMessage.content.find(
        (b: AnthropicContentBlock) =>
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
      content: finalMessage.content as AnthropicMessage["content"],
    });

    const toolUseBlocks = finalMessage.content.filter(
      (b: AnthropicContentBlock) =>
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

export const AnthropicService = {
  generateJSON,
  generateWithTools,
  generateWithToolsStream,
};