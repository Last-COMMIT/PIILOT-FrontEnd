"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { Bot, X, Send } from "lucide-react";
import { sendChatMessage } from "@/features/chatbot";

const INITIAL_MESSAGE = `안녕하세요! PIILOT AI 어시스턴트입니다.
개인정보 보호와 관련된 질문이 있으시면
언제든 물어보세요.`;

export function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<
    Array<{ role: "ai" | "user"; text: string; sources?: string[] }>
  >([{ role: "ai", text: INITIAL_MESSAGE }]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage({ question: trimmed });
      if (response.success && response.result) {
        const result = response.result;
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: result.answer,
            sources: result.sources,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: response.message || "응답을 받는 중 오류가 발생했습니다.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isAuthPage) return null;

  return (
    <>
      {/* 플로팅 버튼: 채팅창이 닫혀 있을 때만 표시 */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all opacity-90",
            "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white",
            "hover:opacity-100 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-main)]"
          )}
          aria-label="챗봇 열기"
        >
          <Bot className="h-7 w-7" />
        </button>
      )}

      {/* 채팅 패널: 열려 있을 때만 표시 */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-5 right-6 z-40 flex flex-col overflow-hidden rounded-xl shadow-2xl",
            // 폭/높이를 화면에 맞게 넓게 잡아 줄바꿈 감소
            "h-[min(720px,calc(100vh-3rem))] w-[min(640px,calc(100vw-3rem))]",
            "border border-[var(--color-content-border)] bg-[var(--color-bg-panel)]"
          )}
        >
          {/* 헤더: 그라데이션, 아이콘, 이름·역할, 닫기 */}
          <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                AI 어시스턴트
              </p>
              <p className="truncate text-xs text-white/90">
                개인정보 보호 전문가
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shrink-0 cursor-pointer rounded p-1.5 text-white/90 hover:bg-white/20 hover:text-white"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "mb-5 flex flex-col gap-2.5",
                  msg.role === "user" && "items-end"
                )}
              >
                <div
                  className={cn(
                    "flex w-full gap-2.5",
                    msg.role === "user" && "flex-row-reverse"
                  )}
                >
                  {msg.role === "ai" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-main-bg)]/20">
                      <Bot className="h-4 w-4 text-[var(--color-main-text)]" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "min-w-0 w-fit max-w-[85%] rounded-lg px-4 py-3 text-[13px] sm:text-sm leading-relaxed",
                      "whitespace-pre-wrap break-words [overflow-wrap:break-word]",
                      msg.role === "user" && "ml-auto text-left",
                      msg.role === "ai"
                        ? "bg-[var(--color-content-border)]/50 text-[var(--color-text-light-gray)]"
                        : "bg-[var(--color-main-bg)]/20 text-white"
                    )}
                  >
                    <div className="space-y-1.5">
                      {msg.text.split("\n").map((line, lineIdx) => (
                        <div key={lineIdx} className="min-h-[1.5em]">
                          {line || "\u00A0"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="shrink-0 flex gap-2 border-t border-[var(--color-content-border)] bg-[var(--color-bg-main)] p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요...."
              disabled={isLoading}
              className={cn(
                "min-w-0 flex-1 h-12 rounded-lg border border-[var(--color-content-border)] bg-[var(--color-bg-panel)] px-4 py-3 text-sm text-white placeholder:text-[var(--color-text-light-gray)]",
                "focus:border-[var(--color-main-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main-border)]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              aria-label="메시지 입력"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={cn(
                "flex h-12 min-w-[52px] shrink-0 cursor-pointer items-center justify-center rounded-lg px-4",
                "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white",
                "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-main)]",
                (isLoading || !input.trim()) && "opacity-50 cursor-not-allowed"
              )}
              aria-label="전송"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
