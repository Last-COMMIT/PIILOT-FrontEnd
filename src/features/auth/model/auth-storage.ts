/** 인증·토큰 저장 키 (localStorage) */
const KEY_AUTHED = "piilot_authed";
const KEY_ACCESS_TOKEN = "piilot_access_token";
const KEY_REFRESH_TOKEN = "piilot_refresh_token";
const KEY_ROLE = "piilot_role";

function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** access token 조회 */
export function getAccessToken(): string | null {
  return safeGetItem(KEY_ACCESS_TOKEN);
}

/** refresh token 조회 */
export function getRefreshToken(): string | null {
  return safeGetItem(KEY_REFRESH_TOKEN);
}

/** 로그인 여부 (piilot_authed) */
export function isAuthed(): boolean {
  return safeGetItem(KEY_AUTHED) === "1";
}

/** 토큰 저장 (로그인/refresh 성공 시). role은 백엔드가 로그인 응답에 포함할 경우 전달 */
export function saveTokens(
  accessToken: string,
  refreshToken: string,
  role?: string,
): void {
  safeSetItem(KEY_AUTHED, "1");
  safeSetItem(KEY_ACCESS_TOKEN, accessToken);
  safeSetItem(KEY_REFRESH_TOKEN, refreshToken);
  if (role != null && role !== "") safeSetItem(KEY_ROLE, role);
}

/** 토큰·인증 정보 제거 (로그아웃/refresh 실패 시) */
export function clearTokens(): void {
  safeRemoveItem(KEY_AUTHED);
  safeRemoveItem(KEY_ACCESS_TOKEN);
  safeRemoveItem(KEY_REFRESH_TOKEN);
  safeRemoveItem(KEY_ROLE);
}

/** 로그인 페이지로 이동 (클라이언트 전용) */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  clearTokens();
  window.location.href = "/login";
}
