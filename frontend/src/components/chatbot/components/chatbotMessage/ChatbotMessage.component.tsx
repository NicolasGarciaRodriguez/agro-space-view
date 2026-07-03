import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";
import type { ChatbotMessageProps } from "../../Chatbot.interface";
import styles from "./ChatbotMessage.module.scss";

export const ChatbotMessage = ({ role, content }: ChatbotMessageProps) => {
  const isUser = role === ChatRole.USER;

  return (
    <div
      className={[
        styles.message,
        isUser ? styles["message--user"] : styles["message--assistant"],
      ].join(" ")}
    >
      <div className={styles.message__bubble}>{content}</div>
    </div>
  );
};
