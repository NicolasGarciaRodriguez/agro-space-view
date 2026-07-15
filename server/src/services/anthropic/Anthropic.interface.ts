import Anthropic from "@anthropic-ai/sdk";
import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";
import { AnthropicContentBlockType } from "@agrospace/shared/enums/AnthropicContentBlockType.enum";

export interface GenerateJSONParams {
  model: string;
  maxTokens: number;
  systemPrompt: string;
  userPrompt: string;
}

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

export interface GenerateWithToolsParams {
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

export interface GenerateWithToolsStreamParams extends GenerateWithToolsParams {
  onToken: (text: string) => void;
}

// Reexport útil para quien necesite el tipo de bloque de contenido
// crudo del SDK, sin tener que importar Anthropic directamente.
export type AnthropicContentBlock = Anthropic.ContentBlock;