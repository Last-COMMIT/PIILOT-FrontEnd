/** 백엔드 API Base URL (.env.local의 NEXT_PUBLIC_API_BASE_URL) */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/** 네트워크 오류(Failed to fetch 등) 시 사용자에게 보여줄 메시지 */
export const API_NETWORK_ERROR_MESSAGE =
  "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지, 주소(.env.local의 NEXT_PUBLIC_API_BASE_URL)가 맞는지, CORS 허용 여부를 확인해 주세요.";

/** API 예외를 사용자용 메시지로 변환 (Failed to fetch → 한글 안내) */
export function getApiErrorMessage(error: unknown): string {
  const raw =
    error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.";
  return raw === "Failed to fetch" || raw.includes("fetch")
    ? API_NETWORK_ERROR_MESSAGE
    : raw;
}
