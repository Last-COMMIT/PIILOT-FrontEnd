import type { ApiResponse } from "@/shared/api";

/** 챗봇 질문 요청 */
export interface ChatbotRequest {
  question: string;
}

/** 챗봇 응답 */
export interface ChatbotResponse {
  answer: string;
  sources: string[];
}

/** 챗봇 API 응답 */
export type ChatbotApiResponse = ApiResponse<ChatbotResponse>;
