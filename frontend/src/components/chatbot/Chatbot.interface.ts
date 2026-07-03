import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";

export interface ChatbotMessageProps {
  role: ChatRole;
  content: string;
}
