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

/**
 * JWT payload에서 role 추출 (백엔드가 응답에 role을 안 넣고 토큰에만 넣은 경우 대비)
 * 서명 검증은 하지 않고 payload만 읽음.
 */
function getRoleFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(decoded) as { role?: string };
    const role = parsed.role;
    return typeof role === "string" && role !== "" ? role : null;
  } catch {
    return null;
  }
}

/** 토큰 저장 (로그인/refresh 성공 시). role은 응답에 있으면 사용, 없으면 JWT payload에서 시도 */
export function saveTokens(
  accessToken: string,
  refreshToken: string,
  role?: string,
): void {
  safeSetItem(KEY_AUTHED, "1");
  safeSetItem(KEY_ACCESS_TOKEN, accessToken);
  safeSetItem(KEY_REFRESH_TOKEN, refreshToken);
  const roleToSave =
    role != null && role !== ""
      ? role
      : getRoleFromJwt(accessToken);
  if (roleToSave != null && roleToSave !== "") safeSetItem(KEY_ROLE, roleToSave);
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
