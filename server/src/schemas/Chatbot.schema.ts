import mongoose, { Schema, Document, Model } from "mongoose";
import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";
import { ChatbotTool } from "@agrospace/shared/enums/ChatbotTool.enum";

export interface IChatToolCall {
  tool: ChatbotTool;
  input: Record<string, unknown>;
}

export interface IChatMessage {
  role: ChatRole;
  content: string;
  toolCalls?: IChatToolCall[];
  createdAt: Date;
}

export interface IConversation {
  userId: mongoose.Types.ObjectId;
  explotacionId: mongoose.Types.ObjectId;
  parcelaId: mongoose.Types.ObjectId | null;
  titulo: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationDocument extends IConversation, Document {}

const ChatToolCallSchema = new Schema<IChatToolCall>(
  {
    tool: { type: String, enum: Object.values(ChatbotTool), required: true },
    input: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: Object.values(ChatRole), required: true },
    content: { type: String, required: true },
    toolCalls: { type: [ChatToolCallSchema], default: undefined },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { _id: false },
);

const ConversationSchema = new Schema<IConversationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    explotacionId: {
      type: Schema.Types.ObjectId,
      ref: "Explotacion",
      required: true,
      index: true,
    },
    parcelaId: {
      type: Schema.Types.ObjectId,
      ref: "Parcela",
      default: null,
    },
    titulo: { type: String, required: true, trim: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });

export const ConversationModel: Model<IConversationDocument> =
  mongoose.model<IConversationDocument>("Conversation", ConversationSchema);
