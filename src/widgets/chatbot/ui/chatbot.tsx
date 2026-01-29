"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { Bot, X, Send } from "lucide-react";

const INITIAL_MESSAGE = `안녕하세요! PIILOT AI 어시스턴트입니다.
개인정보 보호와 관련된 질문이 있으시면
언제든 물어보세요.`;

export function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<
    Array<{ role: "ai" | "user"; text: string }>
  >([{ role: "ai", text: INITIAL_MESSAGE }]);
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    // TODO: 실제 AI API 연동 시 여기서 요청 후 응답 메시지 추가
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "질문해 주셔서 감사합니다. AI 응답 연동 후 답변을 드리겠습니다.",
        },
      ]);
    }, 500);
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
            "hover:opacity-100 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-main)]",
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
            "fixed bottom-5 right-6 z-40 flex h-[700px] w-[380px] flex-col overflow-hidden rounded-xl shadow-2xl",
            "border border-[var(--color-content-border)] bg-[var(--color-bg-panel)]",
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
                  "mb-4 flex gap-2",
                  msg.role === "user" && "flex-row-reverse",
                )}
              >
                {msg.role === "ai" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-main-bg)]/20">
                    <Bot className="h-4 w-4 text-[var(--color-main-text)]" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    msg.role === "ai"
                      ? "bg-[var(--color-content-border)]/50 text-[var(--color-text-light-gray)] whitespace-pre-wrap"
                      : "bg-[var(--color-main-bg)]/20 text-white",
                  )}
                >
                  {msg.text}
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
              className={cn(
                "min-w-0 flex-1 rounded-lg border border-[var(--color-content-border)] bg-[var(--color-bg-panel)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--color-text-light-gray)]",
                "focus:border-[var(--color-main-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main-border)]",
              )}
              aria-label="메시지 입력"
            />
            <button
              type="button"
              onClick={handleSend}
              className={cn(
                "flex h-10 min-w-[52px] shrink-0 cursor-pointer items-center justify-center rounded-lg px-4",
                "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white",
                "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-main)]",
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
