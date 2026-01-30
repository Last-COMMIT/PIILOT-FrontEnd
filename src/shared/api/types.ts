/** API 공통 응답 형식 (명세서 기준) */
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
