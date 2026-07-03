import { ChatbotToggleProps } from "./ChatbotToggle.interface";

export const ChatbotToggle = ({ isOpen, onClick }: ChatbotToggleProps) => {
  return (
    <button
      className={`chatbot-toggle ${isOpen ? "chatbot-toggle--open" : ""}`}
      onClick={onClick}
      aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
    >
      {isOpen ? "✕" : "🤖"}
    </button>
  );
};
