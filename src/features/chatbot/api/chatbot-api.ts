import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type { ChatbotRequest, ChatbotApiResponse } from "./types";

const BASE = `${API_BASE_URL}/api/chatbot`;

function errorMessage(
  data: { message?: string } | null,
  status: number,
): string {
  return data?.message ?? `요청 실패 (${status})`;
}

function toErrorResponse(error: unknown): ChatbotApiResponse {
  return {
    success: false,
    code: "",
    message: getApiErrorMessage(error),
    result: null,
    timestamp: "",
  };
}

/** 챗봇에 질문 전송 */
export async function sendChatMessage(
  body: ChatbotRequest,
): Promise<ChatbotApiResponse> {
  try {
    const res = await fetchWithAuth(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: String(body.question ?? ""),
      }),
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as ChatbotApiResponse;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
      };
    }
    return data;
  } catch (e) {
    return toErrorResponse(e);
  }
}
