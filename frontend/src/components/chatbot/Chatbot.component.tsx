"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ChatbotRepository } from "@agrospace/shared/repositories/Chatbot.repository";
import { useExplotacionStore } from "@/stores/explotacion/Explotacion.store";
import { ChatbotMessage } from "./components/chatbotMessage/ChatbotMessage.component";
import { ChatbotToggle } from "./components/chatbotToggle/ChatbotToggle.component";
import { isHttpError } from "@/lib/http-error";
import type { ConversationDTO } from "@agrospace/shared/dtos/Chatbot.dto";
import styles from "./Chatbot.module.scss";
import { ChatRole } from "@agrospace/shared/enums/ChatRole.enum";

export const Chatbot = () => {
  const activeExplotacion = useExplotacionStore((s) => s.activeExplotacion);
  const params = useParams();
  const parcelaId = typeof params?.id === "string" ? params.id : null;

  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ConversationDTO | null>(
    null,
  );
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Texto del asistente que se está generando en vivo, mientras
  // llegan los fragmentos del stream. Se pinta como un mensaje
  // adicional debajo de los ya guardados en `conversation`.
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length, streamingText]);

  useEffect(() => {
    setConversation(null);
    setError(null);
  }, [activeExplotacion?._id]);

  const loadOrCreateConversation = async () => {
    if (!activeExplotacion) return null;
    setIsStarting(true);
    try {
      const conversations = await ChatbotRepository.list(activeExplotacion._id);

      if (conversations.length > 0) {
        const full = await ChatbotRepository.getById(conversations[0]._id);
        setConversation(full);
        return full;
      }

      const created = await ChatbotRepository.create({
        explotacionId: activeExplotacion._id,
        parcelaId: parcelaId ?? undefined,
      });
      setConversation(created);
      return created;
    } finally {
      setIsStarting(false);
    }
  };

  const handleToggle = async () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    if (willOpen && !conversation) {
      await loadOrCreateConversation();
    }
  };

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isSending) return;

    setError(null);

    let currentConversation = conversation;
    if (!currentConversation) {
      currentConversation = await loadOrCreateConversation();
      if (!currentConversation) return;
    }

    setInput("");
    setIsSending(true);
    setStreamingText("");

    setConversation({
      ...currentConversation,
      messages: [
        ...currentConversation.messages,
        {
          role: ChatRole.USER,
          content: message,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    try {
      const updated = await ChatbotRepository.sendMessageStream(
        currentConversation._id,
        { message },
        (token) => {
          // Cada fragmento se va acumulando y repintando en vivo.
          setStreamingText((prev) => (prev ?? "") + token);
        },
      );
      setConversation(updated);
    } catch (err) {
      setConversation(currentConversation);
      setError(
        isHttpError(err)
          ? (err.message ?? "No se pudo enviar el mensaje.")
          : "No se pudo enviar el mensaje.",
      );
    } finally {
      setIsSending(false);
      setStreamingText(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeExplotacion) return null;

  return (
    <>
      <ChatbotToggle isOpen={isOpen} onClick={handleToggle} />

      {isOpen && (
        <div className={styles.chatbot}>
          <div className={styles.chatbot__header}>
            <span className={styles.chatbot__title}>
              Asistente AgroSpaceView
            </span>
            {parcelaId && (
              <span className={styles.chatbot__context}>
                Contexto: parcela actual
              </span>
            )}
          </div>

          <div className={styles.chatbot__messages}>
            {isStarting ? (
              <div className={styles.chatbot__loading}>
                <span className={styles.chatbot__spinner} />
              </div>
            ) : !conversation || conversation.messages.length === 0 ? (
              <div className={styles.chatbot__empty}>
                <p>
                  Pregúntame sobre el estado de tus parcelas, riegos,
                  tratamientos o cualquier duda agronómica.
                </p>
              </div>
            ) : (
              conversation.messages.map((m, i) => (
                <ChatbotMessage key={i} role={m.role} content={m.content} />
              ))
            )}

            {/* Mensaje del asistente en construcción, mientras llega
                el streaming. Solo se muestra cuando ya hay algo de
                texto — antes de eso, se ve el indicador de "escribiendo". */}
            {streamingText && (
              <ChatbotMessage role={ChatRole.ASSISTANT} content={streamingText} />
            )}

            {isSending && !streamingText && (
              <div className={styles.chatbot__typing}>
                <span />
                <span />
                <span />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <p className={styles.chatbot__error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.chatbot__inputArea}>
            <textarea
              className={styles.chatbot__input}
              placeholder="Escribe tu pregunta…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              rows={1}
            />
            <button
              className={styles.chatbot__send}
              onClick={handleSend}
              disabled={isSending || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};